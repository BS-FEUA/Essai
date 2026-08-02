# BS-Lokossa

Application web de gestion du Bureau Syndical de Lokossa (FEUA).

## Démarrage local

1. Copiez `.env.example` vers `.env.local` et définissez un `SESSION_SECRET` long et aléatoire.
2. Exécutez `npm.cmd run db:generate`, puis `npm.cmd run db:push`.
3. Exécutez `npm.cmd run dev`.

## Déploiement

Définissez `DATABASE_URL` et `SESSION_SECRET` dans l'environnement de déploiement. Le stockage local des documents est adapté au développement uniquement : avant Vercel, remplacez-le par Supabase Storage ou un stockage objet et migrez SQLite vers PostgreSQL/Supabase avec des politiques RLS.

Les intégrations FedaPay, Firebase/Web Push, WhatsApp, Sentry et Supabase ne sont pas configurées sans leurs identifiants respectifs.
