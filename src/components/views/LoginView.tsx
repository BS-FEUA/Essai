'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Loader2, Sun, Moon, Home, Globe, UserPlus, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export function LoginView({ defaultTab = 'login' }: { defaultTab?: 'login' | 'register' }) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const { login, register, isAuthenticated } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Registration state
  const [regForm, setRegForm] = useState({
    email: '',
    password: '',
    matricule: '',
    firstName: '',
    lastName: '',
    phone: '',
    institution: 'INSTI Lokossa',
    filiere: 'Informatique',
    niveau: 'Licence 1',
  });
  const [regError, setRegError] = useState('');
  const [regSubmitted, setRegSubmitted] = useState(false);
  const [regSubmitting, setRegSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingLogin) return;
    setLoginError('');
    if (!email || !password) {
      setLoginError('Veuillez remplir votre email et mot de passe.');
      return;
    }
    setIsSubmittingLogin(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        router.push('/dashboard');
      } else {
        setLoginError(result.error || 'Connexion impossible : vérifiez vos identifiants ou attendez la validation de votre compte par le super administrateur.');
      }
    } catch {
      setLoginError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regSubmitting) return;
    setRegError('');
    if (!regForm.email || !regForm.password || !regForm.firstName || !regForm.lastName) {
      setRegError('Remplissez tous les champs obligatoires : prénom, nom, email, mot de passe et téléphone.');
      return;
    }
    if (!regForm.phone.trim() || regForm.phone.replace(/\D/g, '').length < 8) {
      setRegError('Indiquez un numéro WhatsApp joignable aussi par appel téléphonique classique, sans connexion Internet.');
      return;
    }
    if (regForm.password.length < 8) {
      setRegError('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }
    setRegSubmitting(true);
    try {
      const success = await register(regForm);
      if (success) {
        setRegSubmitted(true);
        setRegError('');
        // No automatic login/redirection anymore because validation is pending
      } else {
        setRegError('La création du compte a échoué. Vérifiez vos informations.');
      }
    } catch (err: any) {
      setRegError(err?.message || 'Erreur lors de l\'inscription.');
    } finally {
      setRegSubmitting(false);
    }
  };

  return (
    <div className="login-page min-h-screen flex flex-col lg:items-center lg:justify-center pt-24 pb-8 px-4 lg:p-4 relative overflow-y-auto overflow-x-hidden bg-transparent text-foreground">
      {/* Top Floating Navigation Header */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button size="sm" className="bg-card dark:bg-slate-900/80 backdrop-blur-md shadow-lg border border-emerald-500/30 text-xs gap-1.5 text-foreground">
              <Home className="h-3.5 w-3.5 text-emerald-400" />
              Accueil
            </Button>
          </Link>
          <Link href="/landa">
            <Button size="sm" className="bg-card dark:bg-slate-900/80 backdrop-blur-md shadow-lg border border-amber-500/30 text-xs gap-1.5 text-amber-600 dark:text-amber-300">
              <Globe className="h-3.5 w-3.5" />
              Espace Landa
            </Button>
          </Link>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="bg-card dark:bg-slate-900/80 backdrop-blur-md border border-slate-300 dark:border-slate-700/50 text-amber-500 dark:text-amber-400"
          onClick={() => document.documentElement.classList.toggle('dark')}
        >
          <Sun className="h-4 w-4 block dark:hidden text-amber-400" />
          <Moon className="h-4 w-4 hidden dark:block text-slate-200" />
        </Button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start lg:items-center relative z-10">
        {/* Left Decorative Branding Card (Liquid Glass) */}
        <div className="hidden lg:flex flex-col items-center justify-center p-10 rounded-3xl bg-card dark:bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 text-foreground relative overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />
          <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-950/80 p-3 flex items-center justify-center border border-amber-400/40 shadow-xl mb-6">
            <img src="/feua-logo.jpeg" alt="FEUA" className="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(212,160,23,0.6)]" />
          </div>
          <h2 className="text-3xl font-black text-center tracking-tight">FEUA — BS Lokossa</h2>
          <p className="text-[var(--feua-green)] dark:text-emerald-300 text-center text-sm font-semibold mt-2 max-w-xs">Bureau Sectoriel des Étudiants (INSTI & ENSET)</p>
          <p className="text-muted-foreground text-center text-xs mt-3 max-w-sm">Fédération des Étudiants de l’Université d’Abomey (UNSTIM)</p>
          
        </div>

        {/* Right Form Container (Liquid Glass Card) */}
        <motion.div {...pageVariants} className="w-full max-w-md mx-auto space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center justify-center mb-2 mt-4">
            <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-900/80 p-3 border border-emerald-500/30 shadow-lg flex items-center justify-center mb-3">
              <img src="/feua-logo.jpeg" alt="FEUA" className="h-full w-full object-contain" />
            </div>
            <h2 className="text-2xl font-black text-center tracking-tight text-foreground">FEUA — BS Lokossa</h2>
            <p className="mt-2 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-200">Fédération des Étudiants de l’Université d’Abomey (UNSTIM)</p>
          </div>

          <div className="w-full">
            {/* Animated Liquid Glass Tabs Bar */}
            <div className="flex w-full mb-5 bg-card dark:bg-slate-900/80 p-1.5 rounded-2xl border border-emerald-500/30 shadow-inner backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-[var(--feua-green)] to-emerald-700 text-white shadow-lg shadow-emerald-900/30 scale-[1.02] border border-emerald-400/40'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <LogIn className="h-4 w-4" />
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-[var(--feua-green)] to-emerald-700 text-white shadow-lg shadow-emerald-900/30 scale-[1.02] border border-emerald-400/40'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Créer un compte
              </button>
            </div>

            {/* Login Tab */}
            {activeTab === 'login' && (
              <div className="space-y-4">
                <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-emerald-500/40 via-amber-400/20 to-emerald-500/10 shadow-lg">
                  <Card className="bg-card dark:bg-slate-900/80 backdrop-blur-xl border-0 rounded-2xl shadow-xl">
                    <CardHeader className="text-center space-y-1 pb-4">
                      <CardTitle className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--feua-green)] to-emerald-600 dark:from-emerald-400 dark:to-emerald-300">
                        Espace Connexion
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-xs">
                        Accédez à votre compte FEUA BS-Lokossa
                      </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleLoginSubmit} data-testid="login-form">
                      <CardContent className="space-y-4">
                        {loginError && (
                          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-start gap-2 animate-fade-in-up">
                            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>{loginError}</span>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <Label htmlFor="login-email" className="text-xs font-semibold text-foreground">
                            Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              id="login-email"
                              type="email"
                              placeholder="votre@email.bj"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 bg-background dark:bg-slate-950/70 border-border dark:border-slate-700/80 text-foreground placeholder-muted-foreground focus:border-[var(--feua-green)] focus:ring-1 focus:ring-[var(--feua-green)] rounded-xl"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="login-password" className="text-xs font-semibold text-slate-200">
                            Mot de passe
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              id="login-password"
                              type="password"
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 bg-background dark:bg-slate-950/70 border-border dark:border-slate-700/80 text-foreground placeholder-muted-foreground focus:border-[var(--feua-green)] focus:ring-1 focus:ring-[var(--feua-green)] rounded-xl"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Link href="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline">
                            Mot de passe oublié ?
                          </Link>
                        </div>
                      </CardContent>

                      <CardFooter className="flex-col gap-3 pt-2">
                        <Button
                          type="submit"
                          data-testid="login-submit"
                          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold shadow-lg shadow-emerald-950/60 rounded-xl py-5"
                          disabled={isSubmittingLogin}
                        >
                          {isSubmittingLogin ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion...
                            </>
                          ) : (
                            'Se connecter'
                          )}
                        </Button>

                        <p className="text-xs text-center text-slate-400">
                          Pas encore membre ?{' '}
                          <button
                            type="button"
                            onClick={() => setActiveTab('register')}
                            className="text-amber-400 hover:text-amber-300 hover:underline font-bold"
                          >
                            Créer un compte
                          </button>
                        </p>
                      </CardFooter>
                    </form>
                  </Card>
                </div>

              </div>
            )}

            {/* Register Tab */}
            {activeTab === 'register' && (
              <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-emerald-500/40 via-amber-400/20 to-emerald-500/10 shadow-[0_12px_35px_rgba(0,0,0,0.5)]">
                <Card className="bg-slate-900/80 backdrop-blur-xl border-0 rounded-2xl text-slate-100 shadow-2xl">
                  <CardHeader className="text-center space-y-1 pb-3">
                    <CardTitle className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-300">
                      Formulaire d'Inscription
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Rejoignez la communauté FEUA BS-Lokossa
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {regSubmitted ? (
                      <div className="text-center space-y-3 py-6 animate-fade-in-up">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h4 className="font-bold text-lg text-emerald-300">Compte créé avec succès !</h4>
                        <p className="text-xs text-slate-300">Votre inscription est terminée. Votre compte doit être validé par un administrateur (CEO) avant que vous ne puissiez vous connecter.</p>
                        <Button variant="outline" className="mt-4" onClick={() => { setRegSubmitted(false); setActiveTab('login'); }}>
                          Retour à la connexion
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleRegisterSubmit} className="space-y-3">
                        {regError && (
                          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>{regError}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs font-semibold text-slate-300">Prénom *</Label>
                            <Input
                              placeholder="Prénom"
                              value={regForm.firstName}
                              onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })}
                              className="bg-slate-950/70 border-slate-700/80 text-white placeholder-slate-500 focus:border-emerald-400 rounded-xl text-xs"
                              required
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-300">Nom *</Label>
                            <Input
                              placeholder="Nom"
                              value={regForm.lastName}
                              onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })}
                              className="bg-slate-950/70 border-slate-700/80 text-white placeholder-slate-500 focus:border-emerald-400 rounded-xl text-xs"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-semibold text-slate-300">Email *</Label>
                          <Input
                            type="email"
                            placeholder="votre@email.bj"
                            value={regForm.email}
                            onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                            className="bg-slate-950/70 border-slate-700/80 text-white placeholder-slate-500 focus:border-emerald-400 rounded-xl text-xs"
                            required
                          />
                        </div>

                        <div>
                          <Label className="text-xs font-semibold text-slate-300">Numéro WhatsApp / téléphone joignable *</Label>
                          <Input
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="+229 90 00 00 00"
                            value={regForm.phone}
                            onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                            className="bg-slate-950/70 border-slate-700/80 text-white placeholder-slate-500 focus:border-emerald-400 rounded-xl text-xs"
                            required
                          />
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-400">Entrez un numéro WhatsApp auquel vous êtes également joignable par appel classique, même sans Internet.</p>
                        </div>

                        <div>
                          <Label className="text-xs font-semibold text-slate-300">Matricule / Identifiant (Optionnel)</Label>
                          <Input
                            placeholder="Ex: FEUA-2026-001"
                            value={regForm.matricule}
                            onChange={(e) => setRegForm({ ...regForm, matricule: e.target.value })}
                            className="bg-slate-950/70 border-slate-700/80 text-white placeholder-slate-500 focus:border-emerald-400 rounded-xl text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs font-semibold text-slate-300">Institution</Label>
                            <Input
                              placeholder="INSTI Lokossa"
                              value={regForm.institution}
                              onChange={(e) => setRegForm({ ...regForm, institution: e.target.value })}
                              className="bg-slate-950/70 border-slate-700/80 text-white placeholder-slate-500 focus:border-emerald-400 rounded-xl text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-semibold text-slate-300">Filière</Label>
                            <Input
                              placeholder="Informatique"
                              value={regForm.filiere}
                              onChange={(e) => setRegForm({ ...regForm, filiere: e.target.value })}
                              className="bg-slate-950/70 border-slate-700/80 text-white placeholder-slate-500 focus:border-emerald-400 rounded-xl text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs font-semibold text-slate-300">Mot de passe *</Label>
                          <Input
                            type="password"
                            placeholder="Au moins 8 caractères"
                            value={regForm.password}
                            onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                            className="bg-slate-950/70 border-slate-700/80 text-white placeholder-slate-500 focus:border-emerald-400 rounded-xl text-xs"
                            minLength={8}
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold shadow-lg shadow-emerald-950/60 rounded-xl py-5 mt-2"
                          disabled={regSubmitting}
                        >
                          {regSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inscription...
                            </>
                          ) : (
                            'Créer mon compte'
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>

                  <CardFooter className="justify-center border-t border-slate-800 py-3">
                    <p className="text-xs text-slate-400">
                      Déjà membre ?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="text-amber-400 hover:text-amber-300 hover:underline font-bold"
                      >
                        Se connecter
                      </button>
                    </p>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
