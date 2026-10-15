import { createServerClient, supabaseAdmin } from '@/lib/db';
import { canSendMessage } from '@/lib/message-rules';
export { canSendMessage } from '@/lib/message-rules';

export interface SessionMember {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  accessLevel: string;
  status: string;
  institution: string | null;
  filiere: string | null;
  niveau: string | null;
  photoUrl: string | null;
}

// Access level hierarchy (higher number = more access)
export const ACCESS_HIERARCHY: Record<string, number> = {
  CEO: 7,
  MAST_IN: 6,
  MAST: 5,
  MASTER: 4,
  MIX: 3,
  MIN: 2,
  AMC: 1,
  IGN: 0,
};

export const ACCESS_LABELS: Record<string, string> = {
  CEO: 'CEO',
  MAST_IN: 'Mast In',
  MAST: 'Mast',
  MASTER: 'Master',
  MIX: 'Mix',
  MIN: 'Min',
  AMC: 'AMC',
  IGN: 'IGN',
};

export function canAccess(userLevel: string, requiredLevel: string): boolean {
  return (ACCESS_HIERARCHY[userLevel] || 0) >= (ACCESS_HIERARCHY[requiredLevel] || 0);
}

export async function getSession(): Promise<SessionMember | null> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: member, error } = await supabaseAdmin
    .from('members')
    .select(`
      id, matricule, first_name, last_name, email, phone, access_level,
      status, institution, filiere, niveau, photo_url
    `)
    .eq('id', user.id)
    .single();

  if (error || !member || member.status !== 'ACTIVE') return null;

  return {
    id: member.id,
    matricule: member.matricule,
    firstName: member.first_name,
    lastName: member.last_name,
    email: member.email,
    phone: member.phone,
    accessLevel: member.access_level,
    status: member.status,
    institution: member.institution,
    filiere: member.filiere,
    niveau: member.niveau,
    photoUrl: member.photo_url,
  };
}
