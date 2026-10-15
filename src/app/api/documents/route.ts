import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getSession, canAccess } from '@/lib/auth';
import { getPagination } from '@/lib/pagination';
import { deleteFromGoogleDrive, getGoogleDriveFileId } from '@/lib/google-drive';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId') || session.id;
    const { page, limit, from, to } = getPagination(searchParams, 20);
    const type = searchParams.get('type') || '';

    if (memberId !== session.id && !canAccess(session.accessLevel, 'MASTER')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    let query = supabaseAdmin
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('member_id', memberId);

    if (type) query = query.eq('type', type);

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data: documentsRaw, count, error } = await query;

    if (error) throw error;

    const documents = (documentsRaw || []).map(d => ({
      ...d,
      fileName: d.file_name,
      fileSize: d.file_size,
      mimeType: d.mime_type,
      fileUrl: d.file_url,
      memberId: d.member_id,
      downloadCount: d.download_count,
      isPublic: d.is_public,
      anneeScolaire: d.annee_scolaire,
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }));

    return NextResponse.json({ documents, total: count || 0, page, limit, pages: Math.ceil((count || 0) / limit) });
  } catch (error) {
    console.error('Documents GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const docId = searchParams.get('id');
    if (!docId) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    const { data: doc } = await supabaseAdmin.from('documents').select('*').eq('id', docId).single();
    if (!doc || (doc.member_id !== session.id && !canAccess(session.accessLevel, 'MASTER'))) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const googleDriveFileId = getGoogleDriveFileId(doc.file_url);
    if (googleDriveFileId) {
      await deleteFromGoogleDrive(googleDriveFileId);
    }

    const { error } = await supabaseAdmin.from('documents').delete().eq('id', docId);
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Documents DELETE error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
