# BS-Lokossa

Application web de gestion du Bureau Syndical de Lokossa (FEUA).

## Démarrage local

1. Copiez `.env.example` vers `.env.local` et définissez un `SESSION_SECRET` long et aléatoire.
2. Exécutez `npm.cmd run db:generate`, puis `npm.cmd run db:push`.
3. Exécutez `npm.cmd run dev`.

## Préparer le déploiement

L’application canonique utilise Supabase pour l’authentification et les données. Le stockage des documents dépend des routes Google Drive et Supabase Storage. Ne déployez pas tant que les variables ci-dessous ne sont pas configurées pour le projet cible et que les migrations Supabase n’ont pas été appliquées.

### Cible recommandée

Le dépôt contient déjà une configuration Next.js adaptée à Vercel (`VERCEL` désactive la sortie `standalone`). Importez le dépôt GitHub dans Vercel et utilisez les valeurs par défaut Next.js : commande de build `npm run build`, répertoire de sortie géré par Next.js, répertoire racine du dépôt.

### Variables d’environnement

Requises pour l’application et l’authentification :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — secret serveur uniquement, ne jamais préfixer par `NEXT_PUBLIC_`.

Requises si le dépôt de documents Google Drive est utilisé :

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`

Les variables Firebase de `.env.example` ne sont nécessaires que si les notifications push Firebase sont activées. Les intégrations FedaPay, WhatsApp et Sentry ne sont pas câblées comme prérequis de build dans cette version ; configurez-les uniquement avec leurs secrets et parcours serveur dédiés.

### Base de données et fichiers

Avant mise en production, configurez les buckets privés Supabase nécessaires et appliquez dans l’ordre les migrations `supabase/migrations/`. Le stockage du système de fichiers de Vercel est éphémère : les fichiers métier doivent rester dans Supabase Storage ou Google Drive, jamais dans un dossier local de l’application.

### Vérifications avant mise en ligne

1. Renseignez les variables dans les environnements Preview et Production de Vercel.
2. Appliquez les migrations Supabase au projet cible et vérifiez les politiques RLS et les buckets privés.
3. Exécutez `npm.cmd run typecheck`, `npm.cmd run lint` et `npm.cmd run build`.
4. Validez connexion, inscription, accès par rôle, upload/téléchargement, commandes et opérations de caisse sur un environnement de prévisualisation avec des comptes de test.
5. Activez le domaine de production après validation de la prévisualisation et vérifiez les journaux Vercel et Supabase.

Ne mettez jamais `.env`, `.env.local` ou une clé de service dans Git. `.env.example` ne contient que des exemples et ne doit pas être utilisé tel quel en production.
