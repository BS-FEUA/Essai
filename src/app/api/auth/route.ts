import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, createServerClient } from '@/lib/db';
import { getSession } from '@/lib/auth';
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
const recoverySchema = z.object({ email: z.string().email() });
const changePasswordSchema = z.object({
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

    const supabase = await createServerClient();

    if (action === 'login') {
      const parsed = loginSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
      }

      // Login using Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (error || !data.user) {
        return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
      }

      // Check if account is active in members table
      const { data: member, error: memberError } = await supabaseAdmin
        .from('members')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (memberError || !member) {
        await supabase.auth.signOut();
        return NextResponse.json({ error: 'Profil membre introuvable' }, { status: 404 });
      }

      if (member.status === 'PENDING_VALIDATION') {
        await supabase.auth.signOut();
        return NextResponse.json({ error: 'Votre compte est en attente de validation par le super administrateur.' }, { status: 403 });
      }
      if (member.status === 'ARCHIVED' || member.status === 'SUSPENDED') {
        await supabase.auth.signOut();
        return NextResponse.json({ error: "Ce compte n'est pas actif." }, { status: 403 });
      }

      // Update last login
      await supabaseAdmin.from('members').update({ last_login_at: new Date().toISOString() }).eq('id', member.id);
      
      await supabaseAdmin.from('audit_logs').insert({
        action: 'LOGIN', actor_id: member.id, entity_type: 'Member', entity_id: member.id, details: '{"message": "Connexion réussie"}'
      });

      return NextResponse.json({ success: true, member });
    }

    if (action === 'register') {
      const parsed = registerSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
      }

      const matriculeToUse = parsed.data.matricule && parsed.data.matricule.trim() !== ''
        ? parsed.data.matricule.trim()
        : `FEUA-${Math.floor(100000 + Math.random() * 900000)}`;

      // Check if matricule exists
      const { data: existingMatricule } = await supabaseAdmin.from('members').select('id').eq('matricule', matriculeToUse).single();
      if (existingMatricule) {
        return NextResponse.json({ error: 'Ce matricule est déjà utilisé.' }, { status: 409 });
      }

      // Create user in Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        email_confirm: true,
        user_metadata: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          matricule: matriculeToUse
        }
      });

      if (authError || !authData.user) {
        if (authError?.message.includes('already registered')) {
          return NextResponse.json({ error: 'Cet email est déjà enregistré.' }, { status: 409 });
        }
        return NextResponse.json({ error: authError?.message || 'Erreur lors de la création Auth' }, { status: 500 });
      }

      const validDob = parsed.data.dateOfBirth && !isNaN(Date.parse(parsed.data.dateOfBirth))
        ? new Date(parsed.data.dateOfBirth).toISOString()
        : null;

      // Update the member profile (trigger already created it hopefully, but we update to be sure)
      const { error: updateError } = await supabaseAdmin.from('members').upsert({
        id: authData.user.id,
        email: parsed.data.email,
        matricule: matriculeToUse,
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        phone: parsed.data.phone || null,
        institution: parsed.data.institution || 'IUT Lokossa',
        filiere: parsed.data.filiere || 'Informatique',
        niveau: parsed.data.niveau || 'Licence 1',
        date_of_birth: validDob,
        access_level: 'MIN',
        status: 'PENDING_VALIDATION',
        country: 'Benin',
      });

      if (updateError) {
        console.error('Registration DB Error:', updateError);
      }

      await supabaseAdmin.from('audit_logs').insert({
        action: 'CREATE', actor_id: authData.user.id, entity_type: 'Member', entity_id: authData.user.id, details: '{"message": "Inscription membre"}'
      });

      return NextResponse.json({
        success: true,
        message: 'Inscription réussie. Votre compte est en attente de validation.'
      }, { status: 201 });
    }

    if (action === 'logout') {
      const session = await getSession();
      if (session) {
        await supabaseAdmin.from('audit_logs').insert({
          action: 'LOGOUT', actor_id: session.id, entity_type: 'Member', entity_id: session.id, details: '{"message": "Déconnexion"}'
        });
      }
      await supabase.auth.signOut();
      return NextResponse.json({ success: true });
    }

    if (action === 'requestRecovery') {
      const parsed = recoverySchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Email requis' }, { status: 400 });
      
      await supabase.auth.resetPasswordForEmail(parsed.data.email);
      return NextResponse.json({ success: true, message: 'Si cet email existe, un lien a été envoyé.' });
    }

    if (action === 'changePassword') {
      const session = await getSession();
      if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

      const parsed = changePasswordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
      }

      const { error } = await supabase.auth.updateUser({
        password: parsed.data.newPassword
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabaseAdmin.from('audit_logs').insert({
        action: 'UPDATE', actor_id: session.id, entity_type: 'Member', entity_id: session.id, details: '{"message": "Changement de mot de passe"}'
      });

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
