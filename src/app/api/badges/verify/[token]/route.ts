import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/db';

const tokenSchema = z.string().uuid();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!tokenSchema.safeParse(token).success) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }

  const { data: member, error } = await supabaseAdmin.from('members')
    .select('matricule, first_name, last_name, access_level, institution, filiere, niveau')
    .eq('badge_verification_token', token)
    .eq('badge_status', 'APPROVED')
    .eq('status', 'ACTIVE')
    .maybeSingle();
  if (error) {
    console.error('Badge verification error:', error);
    return NextResponse.json({ error: 'Vérification temporairement indisponible.' }, { status: 500 });
  }
  if (!member) return NextResponse.json({ valid: false }, { status: 404 });

  return NextResponse.json({
    valid: true,
    member: {
      matricule: member.matricule,
      firstName: member.first_name,
      lastName: member.last_name,
      accessLevel: member.access_level,
      institution: member.institution,
      filiere: member.filiere,
      niveau: member.niveau,
    },
  }, { headers: { 'Cache-Control': 'no-store' } });
}
