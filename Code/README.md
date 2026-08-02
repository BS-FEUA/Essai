# BS-Lokossa Web

Application web du Bureau Syndical de Lokossa, construite avec Next.js, TypeScript, Tailwind CSS et Supabase.

## Démarrage local

1. Copiez `.env.example` vers `.env.local` et renseignez les clés Supabase et Firebase.
2. Installez les dépendances : `pnpm install`.
3. Lancez l’application : `pnpm dev`.

## Contrôles qualité

`pnpm format:check`, `pnpm lint`, `pnpm typecheck` et `pnpm build` doivent être exécutés avant toute fusion vers `develop` ou `main`.

## GitFlow simplifié

- `main` : production ;
- `develop` : intégration ;
- `feature/nom-de-la-fonctionnalite` : travail fonctionnel ;
- `fix/description-du-bug` : correction.

Toute intégration dans `develop` ou `main` passe par une pull request.
