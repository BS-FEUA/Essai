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
import { Mail, Lock, Loader2, Sun, Moon, Home, Globe, UserCheck, ShieldCheck, UserPlus, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    institution: 'IUT Lokossa',
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
      const ok = await login(email, password);
      if (ok) {
        router.push('/dashboard');
      } else {
        setLoginError('Email ou mot de passe incorrect. Essayez les boutons de démonstration ci-dessous.');
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
      setRegError('Veuillez remplir les champs obligatoires (Prénom, Nom, Email, Mot de passe).');
      return;
    }
    if (regForm.password.length < 4) {
      setRegError('Le mot de passe doit comporter au moins 4 caractères.');
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

  const handleQuickFillAndLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoginError('');
    setIsSubmittingLogin(true);
    try {
      const ok = await login(demoEmail, demoPass);
      if (ok) {
        router.push('/dashboard');
      } else {
        setLoginError('Échec de la connexion démo.');
      }
    } catch {
      setLoginError('Erreur de connexion démo.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-[#021c17] via-[#06141a] to-[#01140e] text-slate-100">
      {/* Top Floating Navigation Header */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button size="sm" className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md shadow-lg border border-emerald-500/30 text-xs gap-1.5 text-white">
              <Home className="h-3.5 w-3.5 text-emerald-400" />
              Accueil
            </Button>
          </Link>
          <Link href="/landa">
            <Button size="sm" className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md shadow-lg border border-amber-500/30 text-xs gap-1.5 text-amber-300">
              <Globe className="h-3.5 w-3.5" />
              Espace Landa
            </Button>
          </Link>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700/50 text-amber-400"
          onClick={() => document.documentElement.classList.toggle('dark')}
        >
          <Sun className="h-4 w-4 block dark:hidden text-amber-400" />
          <Moon className="h-4 w-4 hidden dark:block text-slate-200" />
        </Button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mt-14 lg:mt-0 relative z-10">
        {/* Left Decorative Branding Card (Liquid Glass) */}
        <div className="hidden lg:flex flex-col items-center justify-center p-10 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 text-white relative overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />
          <div className="w-24 h-24 rounded-2xl bg-slate-950/80 p-3 flex items-center justify-center border border-amber-400/40 shadow-xl mb-6">
            <img src="/feua-logo.png" alt="FEUA" className="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(212,160,23,0.6)]" />
          </div>
          <h2 className="text-3xl font-black text-center text-white tracking-tight">FEUA — BS Lokossa</h2>
          <p className="text-emerald-300 text-center text-sm font-semibold mt-2 max-w-xs">Bureau Syndical des Étudiants (IUT & ENSET)</p>
          <p className="text-slate-400 text-center text-xs mt-3 max-w-sm">Fédération des Étudiants Universitaires Associés du Bénin</p>
          
          <div className="mt-8 pt-6 border-t border-slate-800 w-full text-center space-y-3">
            <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">Accès Démo 1-Clic :</p>
            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                onClick={() => handleQuickFillAndLogin('ceo@feua.bj', 'ceo2026')}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
              >
                <ShieldCheck className="h-4 w-4 text-amber-400" /> Espace Bureau Exécutif (CEO)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFillAndLogin('master@feua.bj', 'master2026')}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 hover:from-emerald-500/30 hover:to-emerald-600/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
              >
                <UserCheck className="h-4 w-4 text-emerald-400" /> Espace Membre (Master)
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Container (Liquid Glass Card) */}
        <motion.div {...pageVariants} className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900/80 p-2 border border-emerald-500/30 shadow-lg flex items-center justify-center">
              <img src="/feua-logo.png" alt="FEUA" className="h-full w-full object-contain" />
            </div>
          </div>

          <div className="w-full">
            {/* Animated Liquid Glass Tabs Bar */}
            <div className="flex w-full mb-5 bg-slate-900/80 p-1.5 rounded-2xl border border-emerald-500/30 shadow-inner backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-950/50 scale-[1.02] border border-emerald-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
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
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-950/50 scale-[1.02] border border-emerald-400/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Créer un compte
              </button>
            </div>

            {/* Login Tab */}
            {activeTab === 'login' && (
              <div className="space-y-4">
                <div className="relative p-[1px] rounded-2xl bg-gradient-to-b from-emerald-500/40 via-amber-400/20 to-emerald-500/10 shadow-[0_12px_35px_rgba(0,0,0,0.5)]">
                  <Card className="bg-slate-900/80 backdrop-blur-xl border-0 rounded-2xl text-slate-100 shadow-2xl">
                    <CardHeader className="text-center space-y-1 pb-4">
                      <CardTitle className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-300">
                        Espace Connexion
                      </CardTitle>
                      <CardDescription className="text-slate-400 text-xs">
                        Accédez à votre compte FEUA BS-Lokossa
                      </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleLoginSubmit}>
                      <CardContent className="space-y-4">
                        {loginError && (
                          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-start gap-2 animate-fade-in-up">
                            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>{loginError}</span>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <Label htmlFor="login-email" className="text-xs font-semibold text-slate-200">
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
                              className="pl-10 bg-slate-950/70 border-slate-700/80 text-white placeholder-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl"
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
                              className="pl-10 bg-slate-950/70 border-slate-700/80 text-white placeholder-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-xl"
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

                {/* Demo accounts hint card */}
                <div className="p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-amber-500/30 shadow-lg space-y-2">
                  <p className="font-extrabold text-xs text-amber-300 text-center uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" /> Connexion Démo Immédiate
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickFillAndLogin('ceo@feua.bj', 'ceo2026')}
                      className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-amber-500/30 text-left transition flex flex-col group"
                    >
                      <span className="font-bold text-amber-300 group-hover:text-amber-200">Compte Bureau (CEO)</span>
                      <span className="text-[10px] text-slate-400 truncate">ceo@feua.bj</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFillAndLogin('master@feua.bj', 'master2026')}
                      className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-emerald-500/30 text-left transition flex flex-col group"
                    >
                      <span className="font-bold text-emerald-400 group-hover:text-emerald-300">Compte Membre</span>
                      <span className="text-[10px] text-slate-400 truncate">master@feua.bj</span>
                    </button>
                  </div>
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
                              placeholder="IUT Lokossa"
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
                            placeholder="••••••••"
                            value={regForm.password}
                            onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                            className="bg-slate-950/70 border-slate-700/80 text-white placeholder-slate-500 focus:border-emerald-400 rounded-xl text-xs"
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
