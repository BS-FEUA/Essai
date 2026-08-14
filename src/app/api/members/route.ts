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
    const search = searchParams.get('search') || '';
    const accessLevel = searchParams.get('accessLevel') || '';
    const status = searchParams.get('status') || '';
    const institution = searchParams.get('institution') || '';

    let query = supabaseAdmin
      .from('members')
      .select('id, matricule, first_name, last_name, email, phone, access_level, status, institution, filiere, niveau, photo_url, fiche_soumise, carte_etudiant, last_login_at, created_at', { count: 'exact' });

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,matricule.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (accessLevel) query = query.eq('access_level', accessLevel);
    if (status) query = query.eq('status', status);
    if (institution) query = query.eq('institution', institution);

    // AMC and IGN can only see themselves
    if (['AMC', 'IGN'].includes(session.accessLevel)) {
      query = query.eq('id', session.id);
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

      const { data: target } = await supabaseAdmin.from('members').select('*').eq('id', memberId).single();
      
      // Validation of a new registration is exclusively a CEO operation.
      if (target?.status === 'PENDING_VALIDATION' && status === 'ACTIVE' && session.accessLevel !== 'CEO') {
        return NextResponse.json({ error: 'La validation d’un compte est réservée au super administrateur.' }, { status: 403 });
      }
      if (!target) return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 });

      const actorRank = ACCESS_HIERARCHY[session.accessLevel] ?? -1;
      const targetRank = ACCESS_HIERARCHY[target.access_level] ?? -1;
      if (targetRank >= actorRank) {
        return NextResponse.json({ error: 'Impossible de modifier un membre de niveau égal ou supérieur' }, { status: 403 });
      }
      if (accessLevel && !accessLevelSchema.safeParse(accessLevel).success) {
        return NextResponse.json({ error: 'Niveau d\'accès invalide' }, { status: 400 });
      }
      if (status && !memberStatusSchema.safeParse(status).success) {
        return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
      }
      // A manager cannot edit a peer/superior or grant a role at or above their own.
      if (accessLevel && (ACCESS_HIERARCHY[accessLevel] ?? -1) >= actorRank) {
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

      const { data: updated, error } = await supabaseAdmin.from('members').update(updatePayload).eq('id', memberId).select().single();
      if (error) throw error;

      await supabaseAdmin.from('audit_logs').insert({
        action: accessLevel ? 'ROLE_CHANGE' : 'STATUS_CHANGE', 
        actor_id: session.id, 
        entity_type: 'Member', 
        entity_id: memberId, 
        details: JSON.stringify({ accessLevel, status })
      });

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

    const { data: target } = await supabaseAdmin.from('members').select('*').eq('id', memberId).single();
    if (!target) return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 });

    // Also delete from Supabase Auth
    await supabaseAdmin.auth.admin.deleteUser(memberId);
    
    // Deleting from auth.users cascades to members table via RLS foreign key
    // But we manually delete to be sure
    await supabaseAdmin.from('members').delete().eq('id', memberId);

    await supabaseAdmin.from('audit_logs').insert({
      action: 'DELETE',
      actor_id: session.id,
      entity_type: 'Member',
      entity_id: memberId,
      details: JSON.stringify({ message: `Suppression du membre ${target.first_name} ${target.last_name}` })
    });

    return NextResponse.json({ success: true, message: 'Membre supprimé avec succès' });
  } catch (error) {
    console.error('Members DELETE error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
