import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/db';

const memberCodeSchema = z.string().regex(/^FEUA-[A-F0-9]{32}$/i);
const legacyTokenSchema = z.string().uuid();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const isMemberCode = memberCodeSchema.safeParse(token).success;
  const isLegacyToken = legacyTokenSchema.safeParse(token).success;
  if (!isMemberCode && !isLegacyToken) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }

  let query = supabaseAdmin.from('members')
    .select('member_code, matricule, first_name, last_name, access_level, institution, filiere, niveau')
    .eq(isMemberCode ? 'member_code' : 'badge_verification_token', token)
    .eq('badge_status', 'APPROVED')
    .eq('status', 'ACTIVE')
    .maybeSingle();
  const { data: member, error } = await query;
  if (error) {
    console.error('Badge verification error:', error);
    return NextResponse.json({ error: 'Vérification temporairement indisponible.' }, { status: 500 });
  }
  if (!member) return NextResponse.json({ valid: false }, { status: 404 });

  return NextResponse.json({
    valid: true,
    member: {
      memberCode: member.member_code,
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
