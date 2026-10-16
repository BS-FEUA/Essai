import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getSession, canAccess, ACCESS_HIERARCHY } from '@/lib/auth';
import { z } from 'zod';
import { getPagination } from '@/lib/pagination';

const accessLevelSchema = z.enum(['CEO', 'MAST_IN', 'MAST', 'MASTER', 'MIX', 'MIN', 'AMC', 'IGN']);
const memberStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'ARCHIVED', 'PENDING_VALIDATION', 'IGNORANT']);

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const { page, limit, from, to } = getPagination(searchParams, 20);
    const search = (searchParams.get('search') || '').trim().slice(0, 80).replace(/[(),%]/g, '');
    const accessLevel = searchParams.get('accessLevel') || '';
    const status = searchParams.get('status') || '';
    const institution = searchParams.get('institution') || '';
    const canViewMemberDetails = canAccess(session.accessLevel, 'MASTER');

    let query: any = supabaseAdmin
      .from('members')
      .select(
        canViewMemberDetails
          ? 'id, matricule, first_name, last_name, email, phone, access_level, status, institution, filiere, niveau, photo_url, fiche_soumise, carte_etudiant, last_login_at, created_at'
          : 'id, first_name, last_name, access_level, photo_url',
        { count: 'exact' },
      );

    if (canViewMemberDetails) {
      query = query.not('email', 'like', 'deleted+%@example.invalid').neq('status', 'IGNORANT');
    } else {
      // The messaging recipient picker only needs an active member directory.
      query = query.eq('status', 'ACTIVE');
    }

    if (canViewMemberDetails && search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,matricule.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (canViewMemberDetails) {
      if (accessLevel) query = query.eq('access_level', accessLevel);
      if (status) query = query.eq('status', status);
      if (institution) query = query.eq('institution', institution);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data: membersRaw, count, error } = await query;

    if (error) throw error;
    
    // Map snake_case to camelCase
    const members = (membersRaw || []).map(m => ({
      ...m,
      firstName: m.first_name,
      lastName: m.last_name,
      accessLevel: m.access_level,
      photoUrl: m.photo_url,
      ficheSoumise: m.fiche_soumise,
      carteEtudiant: m.carte_etudiant,
      lastLoginAt: m.last_login_at,
      createdAt: m.created_at
    }));

    return NextResponse.json({ 
      members, 
      total: count || 0, 
      page, 
      limit, 
      pages: Math.ceil((count || 0) / limit) 
    });
  } catch (error) {
    console.error('Members GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const { memberId, accessLevel, status, ...updateData } = body;

    if (memberId) {
      // Updating another member - need MASTER+ access
      if (!canAccess(session.accessLevel, 'MASTER')) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
      }

      const { data: target, error: targetError } = await supabaseAdmin.from('members').select('*').eq('id', memberId).single();
      if (targetError && targetError.code !== 'PGRST116') throw targetError;
      
      // Validation of a new registration is exclusively a CEO operation.
      if (target?.status === 'PENDING_VALIDATION' && status === 'ACTIVE' && session.accessLevel !== 'CEO') {
        return NextResponse.json({ error: 'La validation d’un compte est réservée au super administrateur.' }, { status: 403 });
      }
      if (!target) return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 });

      if (memberId === session.id) {
        return NextResponse.json({ error: 'Vous ne pouvez pas modifier votre propre statut ou niveau d’accès.' }, { status: 400 });
      }

      const actorRank = ACCESS_HIERARCHY[session.accessLevel] ?? -1;
      const targetRank = ACCESS_HIERARCHY[target.access_level] ?? -1;
      if (session.accessLevel !== 'CEO' && targetRank >= actorRank) {
        return NextResponse.json({ error: 'Impossible de modifier un membre de niveau égal ou supérieur' }, { status: 403 });
      }
      if (accessLevel && !accessLevelSchema.safeParse(accessLevel).success) {
        return NextResponse.json({ error: 'Niveau d\'accès invalide' }, { status: 400 });
      }
      if (status && !memberStatusSchema.safeParse(status).success) {
        return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
      }
      // Only the CEO may grant the CEO role; other managers cannot grant a
      // role equal to or higher than their own.
      if (accessLevel && session.accessLevel !== 'CEO' && (ACCESS_HIERARCHY[accessLevel] ?? -1) >= actorRank) {
        return NextResponse.json({ error: 'Impossible de modifier ce niveau d\'accès' }, { status: 403 });
      }

      const updatePayload: any = {};
      if (updateData.firstName) updatePayload.first_name = updateData.firstName;
      if (updateData.lastName) updatePayload.last_name = updateData.lastName;
      if (updateData.phone !== undefined) updatePayload.phone = updateData.phone;
      if (updateData.institution) updatePayload.institution = updateData.institution;
      if (updateData.filiere) updatePayload.filiere = updateData.filiere;
      if (updateData.niveau) updatePayload.niveau = updateData.niveau;
      
      if (accessLevel) updatePayload.access_level = accessLevel;
      if (status) updatePayload.status = status;
      
      if (target.status === 'PENDING_VALIDATION' && status === 'ACTIVE') {
        updatePayload.validated_by = session.id;
        updatePayload.validated_at = new Date().toISOString();
      }

      if (Object.keys(updatePayload).length === 0) {
        return NextResponse.json({ error: 'Aucune modification fournie' }, { status: 400 });
      }

      const { data: updated, error } = await supabaseAdmin.from('members').update(updatePayload).eq('id', memberId).select().single();
      if (error) throw error;

      const { error: auditError } = await supabaseAdmin.from('audit_logs').insert({
        action: accessLevel ? 'ROLE_CHANGE' : 'STATUS_CHANGE', 
        actor_id: session.id, 
        entity_type: 'Member', 
        entity_id: memberId, 
        details: JSON.stringify({ accessLevel, status })
      });
      if (auditError) console.error('Member status audit error:', auditError);

      return NextResponse.json({ success: true, member: updated });
    }

    // Updating own profile
    const updatePayload: any = {};
    if (updateData.firstName) updatePayload.first_name = updateData.firstName;
    if (updateData.lastName) updatePayload.last_name = updateData.lastName;
    if (updateData.phone !== undefined) updatePayload.phone = updateData.phone;
    if (updateData.address !== undefined) updatePayload.address = updateData.address;
    if (updateData.city !== undefined) updatePayload.city = updateData.city;
    if (updateData.institution) updatePayload.institution = updateData.institution;
    if (updateData.filiere) updatePayload.filiere = updateData.filiere;
    if (updateData.niveau) updatePayload.niveau = updateData.niveau;

    const { data: updated, error } = await supabaseAdmin.from('members').update(updatePayload).eq('id', session.id).select().single();
    if (error) throw error;

    return NextResponse.json({ success: true, member: updated });
  } catch (error) {
    console.error('Members PUT error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (session.accessLevel !== 'CEO') return NextResponse.json({ error: 'Action réservée au CEO' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('id');
    if (!memberId) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    if (memberId === session.id) {
      return NextResponse.json({ error: 'Impossible de supprimer votre propre compte CEO' }, { status: 400 });
    }

    const { data: target, error: targetError } = await supabaseAdmin.from('members').select('*').eq('id', memberId).single();
    if (targetError && targetError.code !== 'PGRST116') throw targetError;
    if (!target) return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 });

    // Audit logs are immutable and keep a foreign key to their actor. Preserve
    // the member row as an anonymized tombstone and disable its Auth account.
    // This removes access and personal profile data without rewriting history
    // or breaking financial, message, and audit references.
    const anonymizedEmail = `deleted+${memberId}@example.invalid`;
    const { error: anonymizeError } = await supabaseAdmin.from('members').update({
      first_name: 'Compte',
      last_name: 'supprimé',
      email: anonymizedEmail,
      matricule: `DELETED-${memberId}`,
      phone: null,
      institution: null,
      filiere: null,
      niveau: null,
      date_of_birth: null,
      photo_url: null,
      address: null,
      city: null,
      status: 'IGNORANT',
      notes: null,
    }).eq('id', memberId);
    if (anonymizeError) throw anonymizeError;

    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(memberId, {
      email: anonymizedEmail,
      email_confirm: true,
      ban_duration: '876000h',
      user_metadata: {},
    });
    if (authUpdateError) {
      console.error('Member Auth deactivation error:', authUpdateError);
      return NextResponse.json({
        error: 'Le profil a été anonymisé et son accès à l’application est bloqué, mais la désactivation du compte de connexion a échoué. Contactez un administrateur technique.',
      }, { status: 500 });
    }

    const { error: auditError } = await supabaseAdmin.from('audit_logs').insert({
      action: 'DELETE',
      actor_id: session.id,
      entity_type: 'Member',
      entity_id: memberId,
      details: JSON.stringify({ message: `Suppression du membre ${target.first_name} ${target.last_name}` })
    });
    if (auditError) console.error('Member deletion audit error:', auditError);

    return NextResponse.json({ success: true, message: 'Compte désactivé et données personnelles anonymisées. Les références historiques sont conservées.' });
  } catch (error) {
    console.error('Members DELETE error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
