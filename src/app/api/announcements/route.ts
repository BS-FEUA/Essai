import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getSession, canAccess } from '@/lib/auth';

export async function GET() {
  try {
    const { data: announcementsRaw, error } = await supabaseAdmin
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('is_urgent', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const announcements = (announcementsRaw || []).map(a => ({
      ...a,
      isUrgent: a.is_urgent,
      isActive: a.is_active,
      createdBy: a.created_by,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }));

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Announcements GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!canAccess(session.accessLevel, 'MAST')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const body = await req.json();
    const { title, content, isUrgent } = body;

    if (!title || !content) return NextResponse.json({ error: 'Titre et contenu requis' }, { status: 400 });

    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .insert({ title, content, is_urgent: isUrgent || false, created_by: session.id })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, announcement }, { status: 201 });
  } catch (error) {
    console.error('Announcements POST error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!canAccess(session.accessLevel, 'MAST')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const body = await req.json();
    const { id, title, content, isUrgent, isActive } = body;
    if (!id) return NextResponse.json({ error: 'ID d\'annonce requis' }, { status: 400 });

    const updateData: any = {};
    if (typeof title === 'string') updateData.title = title;
    if (typeof content === 'string') updateData.content = content;
    if (typeof isUrgent === 'boolean') updateData.is_urgent = isUrgent;
    if (typeof isActive === 'boolean') updateData.is_active = isActive;

    const { data: updated, error } = await supabaseAdmin
      .from('announcements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin.from('audit_logs').insert({
      action: 'UPDATE', actor_id: session.id, entity_type: 'Announcement', entity_id: id,
      details: JSON.stringify({ message: `Mise à jour annonce: ${updated.title}` }),
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error) {
    console.error('Announcements PUT error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!canAccess(session.accessLevel, 'MAST')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    const { data: ann } = await supabaseAdmin.from('announcements').select('*').eq('id', id).single();
    if (!ann) return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });

    const { error } = await supabaseAdmin.from('announcements').delete().eq('id', id);
    if (error) throw error;

    await supabaseAdmin.from('audit_logs').insert({
      action: 'DELETE', actor_id: session.id, entity_type: 'Announcement', entity_id: id,
      details: JSON.stringify({ message: `Suppression annonce: ${ann.title}` }),
    });

    return NextResponse.json({ success: true, message: 'Annonce supprimée avec succès' });
  } catch (error) {
    console.error('Announcements DELETE error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
