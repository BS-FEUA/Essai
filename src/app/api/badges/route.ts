import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { canAccess, getSession, ACCESS_HIERARCHY } from '@/lib/auth';
import { isLeadershipBadgeLevel } from '@/lib/badge-rules';
import { supabaseAdmin } from '@/lib/db';
import { checkRateLimit } from '@/lib/rate-limit';

const reviewSchema = z.object({
  action: z.literal('review'),
  memberId: z.string().uuid(),
  decision: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().trim().max(500).optional(),
}).strict();

const requestSchema = z.object({ action: z.literal('request') }).strict();

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  try {
    const { data: row, error } = await supabaseAdmin
      .from('members')
      .select('id, matricule, first_name, last_name, access_level, status, institution, filiere, niveau, photo_url, badge_status, badge_rejection_reason, badge_verification_token')
      .eq('id', session.id)
      .single();
    if (error) throw error;

    const canReview = canAccess(session.accessLevel, 'MIN');
    let pendingBadges: Array<Record<string, unknown>> = [];
    if (canReview) {
      const { data, error: queueError } = await supabaseAdmin
        .from('members')
        .select('id, matricule, first_name, last_name, access_level, institution, filiere, niveau, photo_url, badge_status')
        .eq('status', 'ACTIVE')
        .eq('badge_status', 'PENDING')
        .not('email', 'like', 'deleted+%@example.invalid')
        .order('created_at', { ascending: true })
        .limit(50);
      if (queueError) throw queueError;
      pendingBadges = (data || []).map((item) => ({
        id: item.id,
        matricule: item.matricule,
        firstName: item.first_name,
        lastName: item.last_name,
        accessLevel: item.access_level,
        institution: item.institution,
        filiere: item.filiere,
        niveau: item.niveau,
        photoUrl: item.photo_url,
        requiresCeo: isLeadershipBadgeLevel(item.access_level),
        canReview: session.accessLevel === 'CEO'
          || (!isLeadershipBadgeLevel(item.access_level)
            && (ACCESS_HIERARCHY[session.accessLevel] ?? -1) > (ACCESS_HIERARCHY[item.access_level] ?? Number.MAX_SAFE_INTEGER)),
      }));
    }

    const badge = {
      matricule: row.matricule,
      firstName: row.first_name,
      lastName: row.last_name,
      accessLevel: row.access_level,
      status: row.status,
      institution: row.institution,
      filiere: row.filiere,
      niveau: row.niveau,
      photoUrl: row.photo_url,
      badgeStatus: row.badge_status,
      rejectionReason: row.badge_rejection_reason,
      verificationUrl: row.badge_status === 'APPROVED'
        ? new URL(`/verify/${row.badge_verification_token}`, req.nextUrl.origin).toString()
        : null,
    };

    return NextResponse.json({ badge, pendingBadges, canReview });
  } catch (error) {
    console.error('Badge load error:', error);
    return NextResponse.json({ error: 'Impossible de charger les informations du badge.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  try {
    const body = await req.json();
    const request = requestSchema.safeParse(body);
    if (request.success) {
      if (!await checkRateLimit(`badge:request:${session.id}`, 3, 60 * 60 * 1000)) {
        return NextResponse.json({ error: 'Trop de demandes de badge. Réessayez plus tard.' }, { status: 429 });
      }
      const { data: member, error: memberError } = await supabaseAdmin
        .from('members')
        .select('photo_url, badge_status')
        .eq('id', session.id)
        .single();
      if (memberError) throw memberError;
      if (!member.photo_url) {
        return NextResponse.json({ error: 'Ajoutez d’abord une photo de profil pour demander votre badge.' }, { status: 400 });
      }
      if (member.badge_status === 'APPROVED' || member.badge_status === 'PENDING') {
        return NextResponse.json({ error: 'Votre badge est déjà autorisé ou en attente de validation.' }, { status: 409 });
      }

      const { error } = await supabaseAdmin.from('members').update({
        badge_status: 'PENDING',
        badge_authorized_by: null,
        badge_authorized_at: null,
        badge_rejection_reason: null,
        badge_verification_token: randomUUID(),
      }).eq('id', session.id);
      if (error) throw error;
      await supabaseAdmin.from('audit_logs').insert({
        action: 'BADGE_REQUEST', actor_id: session.id, entity_type: 'Member', entity_id: session.id,
        details: JSON.stringify({ message: 'Demande de génération de badge' }),
      });
      return NextResponse.json({ success: true, badgeStatus: 'PENDING' });
    }

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Demande invalide.' }, { status: 400 });
    }
    if (!canAccess(session.accessLevel, 'MIN')) {
      return NextResponse.json({ error: 'Cette action est réservée aux responsables du bureau.' }, { status: 403 });
    }
    if (!await checkRateLimit(`badge:review:${session.id}`, 40, 15 * 60 * 1000)) {
      return NextResponse.json({ error: 'Trop de décisions de badge. Réessayez plus tard.' }, { status: 429 });
    }
    if (parsed.data.memberId === session.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas valider votre propre badge.' }, { status: 403 });
    }

    const { data: target, error: targetError } = await supabaseAdmin
      .from('members')
      .select('id, matricule, access_level, status, photo_url, badge_status')
      .eq('id', parsed.data.memberId)
      .single();
    if (targetError || !target) return NextResponse.json({ error: 'Membre introuvable.' }, { status: 404 });
    if (target.status !== 'ACTIVE') return NextResponse.json({ error: 'Le compte du membre doit être actif.' }, { status: 409 });
    if (target.badge_status !== 'PENDING') return NextResponse.json({ error: 'Cette demande a déjà été traitée.' }, { status: 409 });
    if (!target.photo_url) return NextResponse.json({ error: 'Le membre doit ajouter une photo avant la validation.' }, { status: 409 });

    const isLeadershipBadge = isLeadershipBadgeLevel(target.access_level);
    if (isLeadershipBadge && session.accessLevel !== 'CEO') {
      return NextResponse.json({ error: 'Seul le CEO peut autoriser le badge d’un dirigeant.' }, { status: 403 });
    }
    if (!isLeadershipBadge && session.accessLevel !== 'CEO'
      && (ACCESS_HIERARCHY[session.accessLevel] ?? -1) <= (ACCESS_HIERARCHY[target.access_level] ?? Number.MAX_SAFE_INTEGER)) {
      return NextResponse.json({ error: 'Vous ne pouvez valider que le badge d’un membre de niveau inférieur.' }, { status: 403 });
    }
    if (parsed.data.decision === 'REJECTED' && !parsed.data.reason?.trim()) {
      return NextResponse.json({ error: 'Indiquez le motif du refus.' }, { status: 400 });
    }

    const update = parsed.data.decision === 'APPROVED'
      ? { badge_status: 'APPROVED', badge_authorized_by: session.id, badge_authorized_at: new Date().toISOString(), badge_rejection_reason: null }
      : { badge_status: 'REJECTED', badge_authorized_by: session.id, badge_authorized_at: new Date().toISOString(), badge_rejection_reason: parsed.data.reason?.trim() };
    const { data: updated, error: updateError } = await supabaseAdmin.from('members')
      .update(update).eq('id', target.id).eq('badge_status', 'PENDING')
      .select('id, badge_status').maybeSingle();
    if (updateError) throw updateError;
    if (!updated) return NextResponse.json({ error: 'Cette demande vient d’être traitée par un autre responsable.' }, { status: 409 });

    await supabaseAdmin.from('audit_logs').insert({
      action: parsed.data.decision === 'APPROVED' ? 'BADGE_APPROVED' : 'BADGE_REJECTED',
      actor_id: session.id, entity_type: 'Member', entity_id: target.id,
      details: JSON.stringify({ matricule: target.matricule, reason: parsed.data.reason?.trim() || null }),
    });
    return NextResponse.json({ success: true, badgeStatus: updated.badge_status });
  } catch (error) {
    console.error('Badge update error:', error);
    return NextResponse.json({ error: 'Impossible de traiter la demande de badge.' }, { status: 500 });
  }
}
