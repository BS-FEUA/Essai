'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle2, ArrowLeft, KeyRound, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

export function ForgotPasswordView() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'requestRecovery', email }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Still show step 2 for security (don't reveal if email exists)
        setStep('code');
      } else {
        setStep('code');
      }
    } catch {
      setStep('code'); // Always proceed to avoid email enumeration
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword || newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas ou le code est vide.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recovery', email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Code invalide ou expiré.');
      } else {
        setStep('done');
      }
    } catch {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#021c17] via-[#06141a] to-[#01140e] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900/80 p-2 border border-emerald-500/30 shadow-xl flex items-center justify-center">
            <img src="/feua-logo.jpeg" alt="FEUA" className="h-full w-full object-contain drop-shadow-[0_0_10px_rgba(27,122,61,0.5)]" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'email' && (
            <motion.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-emerald-500/40 via-amber-400/10 to-emerald-500/10">
                <Card className="bg-slate-900/90 backdrop-blur-xl border-0 rounded-2xl text-slate-100 shadow-2xl">
                  <CardHeader className="text-center space-y-2 pb-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-2">
                      <Mail className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">
                      Récupération de compte
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Entrez votre email pour recevoir un code de réinitialisation valable <strong className="text-amber-300">8 minutes</strong>
                    </CardDescription>
                  </CardHeader>

                  <form onSubmit={handleSendCode}>
                    <CardContent className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="recover-email" className="text-xs font-semibold text-slate-300">Adresse email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="recover-email"
                            type="email"
                            placeholder="votre@email.bj"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 bg-slate-950/70 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-400 rounded-xl"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 pt-2">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold shadow-lg rounded-xl py-5"
                        disabled={loading}
                      >
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi...</> : 'Envoyer le code'}
                      </Button>
                      <Link href="/login" className="w-full">
                        <Button variant="ghost" type="button" className="w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl">
                          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la connexion
                        </Button>
                      </Link>
                    </CardFooter>
                  </form>
                </Card>
              </div>
            </motion.div>
          )}

          {step === 'code' && (
            <motion.div key="code" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-amber-500/40 via-emerald-400/10 to-amber-500/10">
                <Card className="bg-slate-900/90 backdrop-blur-xl border-0 rounded-2xl text-slate-100 shadow-2xl">
                  <CardHeader className="text-center space-y-2 pb-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 mb-2">
                      <KeyRound className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-300">
                      Code de récupération
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Si un compte existe pour <strong className="text-slate-200">{email}</strong>, un code à 6 chiffres a été envoyé. Saisissez-le ci-dessous.
                    </CardDescription>
                  </CardHeader>

                  <form onSubmit={handleResetPassword}>
                    <CardContent className="space-y-4">
                      {error && (
                        <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs animate-fade-in-up">
                          {error}
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">Code à 6 chiffres *</Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="123456"
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="text-center text-xl font-bold tracking-[0.5em] bg-slate-950/70 border-slate-700 text-white placeholder-slate-600 focus:border-amber-400 rounded-xl"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">Nouveau mot de passe *</Label>
                        <div className="relative">
                          <Input
                            type={showPw ? 'text' : 'password'}
                            placeholder="Min. 6 caractères"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pr-10 bg-slate-950/70 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-400 rounded-xl"
                            required
                          />
                          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-slate-400 hover:text-white">
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">Confirmer le mot de passe *</Label>
                        <Input
                          type="password"
                          placeholder="Répétez le mot de passe"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-slate-950/70 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-400 rounded-xl"
                          required
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 pt-2">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold shadow-lg rounded-xl py-5"
                        disabled={loading}
                      >
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Réinitialisation...</> : 'Réinitialiser le mot de passe'}
                      </Button>
                      <Button variant="ghost" type="button" onClick={() => setStep('email')} className="w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Changer l&apos;email
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-emerald-500/50 to-emerald-500/10">
                <Card className="bg-slate-900/90 backdrop-blur-xl border-0 rounded-2xl text-slate-100 shadow-2xl text-center">
                  <CardHeader className="space-y-3 pt-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                      className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 text-emerald-400"
                    >
                      <ShieldCheck className="h-9 w-9" />
                    </motion.div>
                    <CardTitle className="text-xl font-black text-emerald-300">Mot de passe réinitialisé !</CardTitle>
                    <CardDescription className="text-slate-300 text-sm">
                      Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pb-8 pt-4">
                    <Link href="/login" className="w-full">
                      <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold shadow-lg rounded-xl py-5">
                        Se connecter
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
