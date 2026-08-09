import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash, compare } from 'bcryptjs';
import { login, createSessionCookie, getSession, deleteSessionCookie } from '@/lib/auth';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const loginSchema = z.object({
  email: z.string().email('Format email invalide'),
  password: z.string().min(1, 'Mot de passe requis')
});
const registerSchema = z.object({
  email: z.string().email('Format email invalide'),
  password: z.string().min(4, 'Mot de passe de 4 caractères minimum'),
  matricule: z.string().optional(),
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  phone: z.string().optional(),
  institution: z.string().optional(),
  filiere: z.string().optional(),
  niveau: z.string().optional(),
  dateOfBirth: z.string().optional(),
  invitationCode: z.string().optional(),
});
const recoverySchema = z.object({ email: z.string().email(), code: z.string().length(6), newPassword: z.string().min(6) });
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string().min(1, 'Confirmation requise'),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Les mots de passe ne correspondent pas', path: ['confirmPassword'] });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    const limits: Record<string, { limit: number; windowMs: number }> = {
      login: { limit: 100, windowMs: 15 * 60 * 1000 },
      register: { limit: 100, windowMs: 60 * 60 * 1000 },
      recovery: { limit: 100, windowMs: 60 * 60 * 1000 },
    };
    const policy = limits[action];
    if (policy && !checkRateLimit(`auth:${action}:${getClientIp(req.headers)}`, policy.limit, policy.windowMs)) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans un moment.' }, { status: 429 });
    }

    if (action === 'login') {
      const parsed = loginSchema.safeParse(body);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues[0]?.message || 'Données invalides';
        return NextResponse.json({ error: errorMsg }, { status: 400 });
      }

      try {
        const member = await login(parsed.data.email, parsed.data.password);
        if (!member) return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });

        const cookie = createSessionCookie(member.id);
        const res = NextResponse.json({ success: true, member, token: cookie.value });
        res.cookies.set(cookie.name, cookie.value, cookie);
        return res;
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 403 });
      }
    }

    if (action === 'register') {
      const parsed = registerSchema.safeParse(body);
      if (!parsed.success) {
        const issueMsg = parsed.error.issues[0]?.message || 'Données invalides';
        return NextResponse.json({ error: issueMsg, details: parsed.error.flatten() }, { status: 400 });
      }

      try {
        const matriculeToUse = parsed.data.matricule && parsed.data.matricule.trim() !== ''
          ? parsed.data.matricule.trim()
          : `FEUA-${Math.floor(100000 + Math.random() * 900000)}`;

        const existing = await db.member.findFirst({
          where: { OR: [{ email: parsed.data.email }, { matricule: matriculeToUse }] }
        });
        if (existing) {
          if (existing.email === parsed.data.email) {
            return NextResponse.json({ error: 'Cet email est déjà enregistré.' }, { status: 409 });
          }
          return NextResponse.json({ error: 'Ce matricule est déjà utilisé.' }, { status: 409 });
        }

        const passwordHash = await hash(parsed.data.password, 10);
        const validDob = parsed.data.dateOfBirth && !isNaN(Date.parse(parsed.data.dateOfBirth))
          ? new Date(parsed.data.dateOfBirth)
          : null;

        const member = await db.member.create({
          data: {
            email: parsed.data.email,
            passwordHash,
            matricule: matriculeToUse,
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            phone: parsed.data.phone || null,
            institution: parsed.data.institution || 'IUT Lokossa',
            filiere: parsed.data.filiere || 'Informatique',
            niveau: parsed.data.niveau || 'Licence 1',
            dateOfBirth: validDob,
            accessLevel: 'MIN',
            status: 'PENDING_VALIDATION',
            country: 'Benin',
          },
        });

        await db.auditLog.create({
          data: { action: 'CREATE', actorId: member.id, entityType: 'Member', entityId: member.id, details: 'Inscription membre' }
        });

        return NextResponse.json({
          success: true,
          id: member.id,
          message: 'Inscription réussie. Votre compte est en attente de validation par le super administrateur.'
        }, { status: 201 });
      } catch (regError: any) {
        console.error('Registration error details:', regError);
        return NextResponse.json({ error: `Erreur lors de la création du compte: ${regError.message}` }, { status: 500 });
      }
    }

    if (action === 'logout') {
      const session = await getSession();
      if (session) {
        await db.auditLog.create({ data: { action: 'LOGOUT', actorId: session.id, entityType: 'Member', entityId: session.id, details: 'Déconnexion' } });
      }
      const res = NextResponse.json({ success: true });
      const cookie = deleteSessionCookie();
      res.cookies.set(cookie.name, cookie.value, cookie);
      return res;
    }

    if (action === 'requestRecovery') {
      const { email: recEmail } = body;
      if (!recEmail) return NextResponse.json({ error: 'Email requis' }, { status: 400 });
      // Always return 200 to prevent email enumeration
      const memberForRec = await db.member.findUnique({ where: { email: recEmail } });
      if (memberForRec) {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        await db.member.update({
          where: { id: memberForRec.id },
          data: {
            recoveryCode: code,
            recoveryExpiry: new Date(Date.now() + 8 * 60 * 1000), // 8 minutes
          },
        });
        // In production: send `code` via email/SMS
        console.log(`[DEV] Recovery code for ${recEmail}: ${code}`);
      }
      return NextResponse.json({ success: true, message: 'Si cet email existe, un code a été envoyé.' });
    }

    if (action === 'recovery') {
      const parsed = recoverySchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Données invalides' }, { status: 400 });

      const member = await db.member.findUnique({ where: { email: parsed.data.email } });
      if (!member || !member.recoveryCode || member.recoveryCode !== parsed.data.code) {
        return NextResponse.json({ error: 'Code de récupération invalide' }, { status: 400 });
      }
      if (member.recoveryExpiry && member.recoveryExpiry < new Date()) {
        return NextResponse.json({ error: 'Code expiré' }, { status: 400 });
      }

      const passwordHash = await hash(parsed.data.newPassword, 12);
      await db.member.update({ where: { id: member.id }, data: { passwordHash, recoveryCode: null, recoveryExpiry: null, loginAttempts: 0, lockedUntil: null } });
      return NextResponse.json({ success: true, message: 'Mot de passe réinitialisé.' });
    }

    if (action === 'changePassword') {
      const session = await getSession();
      if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

      const parsed = changePasswordSchema.safeParse(body);
      if (!parsed.success) {
        const msg = parsed.error.flatten().fieldErrors.confirmPassword?.[0] || parsed.error.flatten().fieldErrors.newPassword?.[0] || 'Données invalides';
        return NextResponse.json({ error: msg }, { status: 400 });
      }

      const member = await db.member.findUnique({ where: { id: session.id }, select: { id: true, passwordHash: true } });
      if (!member) return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 });

      const valid = await compare(parsed.data.currentPassword, member.passwordHash);
      if (!valid) return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 });

      const passwordHash = await hash(parsed.data.newPassword, 12);
      await db.member.update({ where: { id: session.id }, data: { passwordHash } });

      await db.auditLog.create({ data: { action: 'UPDATE', actorId: session.id, entityType: 'Member', entityId: session.id, details: 'Changement de mot de passe' } });

      return NextResponse.json({ success: true, message: 'Mot de passe modifié avec succès.' });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    return NextResponse.json({ member: session });
  } catch {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
}
