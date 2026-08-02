import { db } from '@/lib/db';
import { compare } from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

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

export function canSendMessage(senderLevel: string, receiverLevel: string): boolean {
  // Min cannot message Min, Mix cannot message Mix
  if (senderLevel === 'MIN' && receiverLevel === 'MIN') return false;
  if (senderLevel === 'MIX' && receiverLevel === 'MIX') return false;
  return true;
}

const SESSION_COOKIE = 'bs-session';
const SESSION_SECRET = process.env.SESSION_SECRET || (process.env.NODE_ENV === 'development' ? 'bs-lokossa-development-secret' : '');

function signSession(memberId: string): string {
  if (!SESSION_SECRET) throw new Error('SESSION_SECRET must be configured in production');
  const signature = createHmac('sha256', SESSION_SECRET).update(memberId).digest('base64url');
  return `${memberId}.${signature}`;
}

function readSignedSession(value: string): string | null {
  const separator = value.lastIndexOf('.');
  if (separator < 1 || !SESSION_SECRET) return null;
  const memberId = value.slice(0, separator);
  const providedSignature = value.slice(separator + 1);
  const expectedSignature = createHmac('sha256', SESSION_SECRET).update(memberId).digest('base64url');
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  return provided.length === expected.length && timingSafeEqual(provided, expected) ? memberId : null;
}

export async function getSession(): Promise<SessionMember | null> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    const headersList = await headers();
    sessionId = headersList.get('x-bs-session') || undefined;
  }

  if (!sessionId) return null;
  const memberId = readSignedSession(sessionId);
  if (!memberId) return null;

  const member = await db.member.findUnique({
    where: { id: memberId },
    select: {
      id: true, matricule: true, firstName: true, lastName: true,
      email: true, phone: true, accessLevel: true, status: true,
      institution: true, filiere: true, niveau: true, photoUrl: true,
    },
  });

  if (!member || member.status === 'ARCHIVED' || member.status === 'IGNORANT') return null;
  return member;
}

export async function login(email: string, password: string): Promise<SessionMember | null> {
  const member = await db.member.findUnique({ where: { email } });
  if (!member) return null;

  // Check lockout
  if (member.lockedUntil && member.lockedUntil > new Date()) return null;

  const valid = await compare(password, member.passwordHash);
  if (!valid) {
    // Increment login attempts
    await db.member.update({
      where: { id: member.id },
      data: {
        loginAttempts: { increment: 1 },
        ...(member.loginAttempts >= 4 ? { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) } : {}),
      },
    });
    return null;
  }

  // Reset login attempts and update last login
  await db.member.update({
    where: { id: member.id },
    data: { loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  // Create audit log
  await db.auditLog.create({
    data: { action: 'LOGIN', actorId: member.id, entityType: 'Member', entityId: member.id, details: 'Connexion réussie' },
  });

  return {
    id: member.id, matricule: member.matricule, firstName: member.firstName, lastName: member.lastName,
    email: member.email, phone: member.phone, accessLevel: member.accessLevel,
    status: member.status, institution: member.institution, filiere: member.filiere,
    niveau: member.niveau, photoUrl: member.photoUrl,
  };
}

export function createSessionCookie(memberId: string) {
  return {
    name: SESSION_COOKIE,
    value: signSession(memberId),
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
    path: '/',
    maxAge: 60 * 60 * 24,
  };
}

export function deleteSessionCookie() {
  return { name: SESSION_COOKIE, value: '', httpOnly: true, secure: true, sameSite: 'none' as const, path: '/', maxAge: 0 };
}
