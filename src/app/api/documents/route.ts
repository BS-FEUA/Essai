import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getSession, canAccess } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId') || session.id;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || '';

    if (memberId !== session.id && !canAccess(session.accessLevel, 'MASTER')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    let query = supabaseAdmin
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('member_id', memberId);

    if (type) query = query.eq('type', type);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
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

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const { title, type, fileName, fileSize, mimeType, description, anneeScolaire } = body;

    const fileUrl = `/documents/${randomUUID()}_${fileName || 'document'}`;
    const { data: doc, error } = await supabaseAdmin.from('documents').insert({
      title, 
      type: type || 'AUTRE', 
      file_name: fileName || 'document.pdf',
      file_size: fileSize || 0, 
      mime_type: mimeType || 'application/pdf',
      file_url: fileUrl, 
      member_id: session.id, 
      description, 
      annee_scolaire: anneeScolaire,
    }).select().single();

    if (error) throw error;

    await supabaseAdmin.from('audit_logs').insert({
      action: 'DOCUMENT_UPLOAD', actor_id: session.id, entity_type: 'Document', entity_id: doc.id, details: JSON.stringify({ message: `Upload: ${title}` })
    });

    const mappedDoc = {
      ...doc,
      fileName: doc.file_name,
      fileSize: doc.file_size,
      mimeType: doc.mime_type,
      fileUrl: doc.file_url,
      memberId: doc.member_id,
      downloadCount: doc.download_count,
      isPublic: doc.is_public,
      anneeScolaire: doc.annee_scolaire,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at
    };

    return NextResponse.json({ success: true, document: mappedDoc }, { status: 201 });
  } catch (error) {
    console.error('Documents POST error:', error);
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

    const { error } = await supabaseAdmin.from('documents').delete().eq('id', docId);
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Documents DELETE error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
