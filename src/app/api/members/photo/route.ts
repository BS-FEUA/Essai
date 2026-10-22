import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

const BUCKET = 'member-avatars';
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('photo');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Sélectionnez une photo à envoyer.' }, { status: 400 });
    }

    const extension = ALLOWED_PHOTO_TYPES.get(file.type);
    if (!extension) {
      return NextResponse.json({ error: 'Format non accepté. Utilisez une image JPG, PNG ou WebP.' }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: 'La photo doit peser moins de 3 Mo.' }, { status: 400 });
    }

    const { data: currentMember, error: memberError } = await supabaseAdmin
      .from('members')
      .select('photo_url')
      .eq('id', session.id)
      .single();
    if (memberError) throw memberError;

    const path = `${session.id}/${randomUUID()}.${extension}`;
    const { error: uploadError } = await supabaseAdmin.storage.from(BUCKET).upload(
      path,
      Buffer.from(await file.arrayBuffer()),
      { contentType: file.type, cacheControl: '3600', upsert: false },
    );
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    const photoUrl = publicUrlData.publicUrl;
    const { error: updateError } = await supabaseAdmin
      .from('members')
      .update({ photo_url: photoUrl })
      .eq('id', session.id);

    if (updateError) {
      await supabaseAdmin.storage.from(BUCKET).remove([path]);
      throw updateError;
    }

    const bucketMarker = `/storage/v1/object/public/${BUCKET}/`;
    const previousPath = currentMember.photo_url?.split(bucketMarker)[1];
    if (previousPath?.startsWith(`${session.id}/`)) {
      await supabaseAdmin.storage.from(BUCKET).remove([decodeURIComponent(previousPath)]);
    }

    await supabaseAdmin.from('audit_logs').insert({
      action: 'MEMBER_UPDATE',
      actor_id: session.id,
      entity_type: 'Member',
      entity_id: session.id,
      details: JSON.stringify({ message: 'Photo de profil modifiée' }),
    });

    return NextResponse.json({ success: true, photoUrl });
  } catch (error) {
    console.error('Member photo upload error:', error);
    return NextResponse.json({ error: 'Impossible d’enregistrer la photo. Réessayez plus tard.' }, { status: 500 });
  }
}
