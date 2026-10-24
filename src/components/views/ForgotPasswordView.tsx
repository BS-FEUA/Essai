'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Mail, ShieldCheck } from 'lucide-react';

type RecoveryStep = 'email' | 'sent' | 'checking' | 'reset' | 'done';

const inputClass = 'h-12 rounded-xl border-slate-600 bg-slate-950 text-white placeholder:text-slate-500 focus-visible:ring-emerald-400';

export function ForgotPasswordView() {
  const router = useRouter();
  const [step, setStep] = useState<RecoveryStep>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const isRecoveryRedirect = window.location.pathname === '/reset-password';
    if (!isRecoveryRedirect) return;

    setStep('checking');
    const supabase = getSupabaseBrowserClient();
    let recoveryConfirmed = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        recoveryConfirmed = true;
        setError('');
        setStep('reset');
        // Remove the one-time tokens from the address bar after Supabase consumes them.
        window.history.replaceState(null, '', '/reset-password');
      }
    });

    const timeout = window.setTimeout(() => {
      if (!recoveryConfirmed) {
        setError('Ce lien de réinitialisation est invalide ou expiré. Demandez-en un nouveau.');
        setStep('email');
        window.history.replaceState(null, '', '/forgot-password');
      }
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleSendLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'requestRecovery', email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Impossible d’envoyer le lien. Réessayez dans quelques instants.');
        return;
      }
      setStep('sent');
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion puis réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setError(updateError.message || 'La modification a échoué. Demandez un nouveau lien.');
        return;
      }

      setStep('done');
      // The recovery session is one-time; end it so the user can sign in with the new password.
      await supabase.auth.signOut();
    } catch {
      setError('Impossible de modifier le mot de passe. Demandez un nouveau lien puis réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const title = step === 'email'
    ? 'Réinitialiser votre mot de passe'
    : step === 'sent'
      ? 'Consultez votre boîte mail'
      : step === 'checking'
        ? 'Vérification du lien'
        : step === 'reset'
          ? 'Choisir un nouveau mot de passe'
          : 'Mot de passe mis à jour';

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_#123b32_0%,_#07151b_48%,_#050b10_100%)] px-4 py-10 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/25 bg-[#101d25] p-2 shadow-xl">
            <img src="/feua-logo-transparent.png" alt="Logo FEUA" className="h-full w-full object-contain" />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-emerald-300/20 bg-[#101d25] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-lime-300 to-amber-400" />
          <div className="p-6 sm:p-9">
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
                {step === 'email' || step === 'sent' ? <Mail className="h-6 w-6" /> : step === 'done' ? <ShieldCheck className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{title}</h1>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-300">
                {step === 'email' && 'Saisissez l’adresse liée à votre compte. Nous vous enverrons un lien sécurisé pour créer un nouveau mot de passe.'}
                {step === 'sent' && 'Si un compte correspond à cette adresse, un lien de réinitialisation vient d’être envoyé. Ouvrez-le depuis cet appareil.'}
                {step === 'checking' && 'Nous vérifions votre lien sécurisé. Cela ne prend que quelques secondes.'}
                {step === 'reset' && 'Votre lien est valide. Choisissez un nouveau mot de passe pour retrouver l’accès à votre compte.'}
                {step === 'done' && 'Votre nouveau mot de passe est enregistré. Vous pouvez maintenant vous connecter.'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === 'email' && (
                <motion.form key="email" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} onSubmit={handleSendLink} className="space-y-5">
                  {error && <div role="alert" className="rounded-xl border border-red-400/30 bg-red-950/50 px-4 py-3 text-sm text-red-200">{error}</div>}
                  <div className="space-y-2">
                    <Label htmlFor="recovery-email" className="text-sm font-semibold text-slate-200">Adresse e-mail</Label>
                    <div className="relative">
                      <Mail aria-hidden="true" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input id="recovery-email" type="email" autoComplete="email" placeholder="vous@exemple.com" value={email} onChange={(event) => setEmail(event.target.value)} className={`${inputClass} pl-11`} required />
                    </div>
                  </div>
                  <Button type="submit" className="h-12 w-full rounded-xl bg-emerald-600 text-base font-bold text-white hover:bg-emerald-500" disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi en cours…</> : 'Recevoir le lien sécurisé'}
                  </Button>
                </motion.form>
              )}

              {step === 'sent' && (
                <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5 text-center">
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-950/30 p-4 text-left text-sm leading-6 text-slate-200">
                    <p className="font-semibold text-emerald-200">Vérifiez votre boîte de réception</p>
                    <p className="mt-1">Pensez aussi aux courriers indésirables. Le lien est à usage unique et peut expirer.</p>
                  </div>
                  <Button type="button" variant="outline" className="h-11 w-full rounded-xl border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white" onClick={() => setStep('email')}>
                    Renvoyer un lien
                  </Button>
                </motion.div>
              )}

              {step === 'checking' && (
                <motion.div key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3 py-5 text-sm text-slate-300">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-300" /> Vérification en cours…
                </motion.div>
              )}

              {step === 'reset' && (
                <motion.form key="reset" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} onSubmit={handleResetPassword} className="space-y-4">
                  {error && <div role="alert" className="rounded-xl border border-red-400/30 bg-red-950/50 px-4 py-3 text-sm text-red-200">{error}</div>}
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-semibold text-slate-200">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input id="new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} placeholder="Au moins 8 caractères" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={`${inputClass} pr-12`} required />
                      <button type="button" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-white">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-semibold text-slate-200">Confirmer le mot de passe</Label>
                    <Input id="confirm-password" type="password" autoComplete="new-password" minLength={8} placeholder="Saisissez-le à nouveau" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} required />
                  </div>
                  <Button type="submit" className="h-12 w-full rounded-xl bg-emerald-600 text-base font-bold text-white hover:bg-emerald-500" disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement…</> : 'Enregistrer le nouveau mot de passe'}
                  </Button>
                </motion.form>
              )}

              {step === 'done' && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"><CheckCircle2 className="h-8 w-8" /></div>
                  <Button type="button" onClick={() => router.push('/login')} className="h-12 w-full rounded-xl bg-emerald-600 text-base font-bold text-white hover:bg-emerald-500">Continuer vers la connexion</Button>
                </motion.div>
              )}
            </AnimatePresence>

            {step !== 'checking' && step !== 'done' && (
              <div className="mt-6 border-t border-white/10 pt-4 text-center">
                <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-300 transition hover:text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la connexion
                </Link>
              </div>
            )}
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-slate-400">FEUA · BS Lokossa — Protection de votre compte</p>
      </motion.section>
    </main>
  );
}
