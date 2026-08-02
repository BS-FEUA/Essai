'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle2, ArrowLeft, Sun, Moon } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export function ForgotPasswordView() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[var(--feua-green-light)] to-background">
      <Button variant="ghost" size="icon" className="fixed top-4 right-4 z-50" onClick={() => document.documentElement.classList.toggle('dark')}>
        <Sun className="h-5 w-5 block dark:hidden" />
        <Moon className="h-5 w-5 hidden dark:block" />
      </Button>
      <motion.div {...pageVariants} className="w-full max-w-md">
        <Card className="shadow-[0_20px_50px_rgba(27,122,61,0.12)] border-white/50 glass-surface animate-pop-in">
          {sent ? (
            <>
              <CardHeader className="text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl text-[var(--feua-green)]">Email envoyé</CardTitle>
                <CardDescription>
                  Un code de récupération valable 8 minutes a été envoyé à <strong>{email}</strong>.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Link href="/login" className="w-full">
                  <Button className="w-full bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white">
                    Retour à la connexion
                  </Button>
                </Link>
              </CardFooter>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardHeader className="text-center space-y-2">
                <img src="/feua-logo.png" alt="FEUA" className="h-12 w-12 mx-auto object-contain" />
                <CardTitle className="text-xl text-[var(--feua-green)]">Récupération de compte</CardTitle>
                <CardDescription>Entrez votre email pour recevoir un code de réinitialisation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recover-email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="recover-email" type="email" placeholder="votre@email.bj" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button type="submit" className="w-full bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white">
                  Envoyer le code
                </Button>
                <Link href="/login" className="w-full">
                  <Button variant="outline" type="button" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                  </Button>
                </Link>
              </CardFooter>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
