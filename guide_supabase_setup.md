# Guide : Créer le projet Supabase BS-Lokossa

## Étape 1 — Créer le projet

1. Va sur **[app.supabase.com](https://app.supabase.com)**
2. Clique sur **"New Project"**
3. Remplis :
   - **Name** : `bs-lokossa`
   - **Database Password** : choisis un mot de passe fort (note-le bien)
   - **Region** : `West EU (Ireland)` — le plus proche du Bénin disponible
   - **Plan** : Free
4. Clique **"Create new project"** → attendre ~2 minutes

---

## Étape 2 — Récupérer les clés API

Une fois le projet créé :

1. Dans le menu gauche : **Project Settings** → **API**
2. Note ces 3 valeurs :

| Variable | Où la trouver |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" (ex: `https://abcdefgh.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "Project API keys" → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | "Project API keys" → `service_role` `secret` ⚠️ |

---

## Étape 3 — Configurer l'Auth Supabase

1. Menu gauche : **Authentication** → **Providers**
2. Active **Email** (déjà activé par défaut)
3. Dans **Authentication** → **Email Templates**, personnalise si souhaité (optionnel)
4. Dans **Authentication** → **URL Configuration** :
   - **Site URL** : `http://localhost:3000` (pour le dev)
   - **Redirect URLs** : `http://localhost:3000/dashboard`

---

## Étape 4 — Créer les Storage Buckets

1. Menu gauche : **Storage**
2. Clique **"New bucket"** :
   - **Name** : `documents`
   - **Public** : ❌ Non (privé, accès via signed URLs)
3. Crée un second bucket :
   - **Name** : `avatars`
   - **Public** : ✅ Oui (photos de profil)

---

## ✅ Une fois ces 4 étapes faites

Reviens dans le chat et partage :
- Ton `SUPABASE_URL`
- Ton `SUPABASE_ANON_KEY`
- Ton `SUPABASE_SERVICE_ROLE_KEY`

Et je démarre immédiatement l'exécution de la migration complète !

---

> [!WARNING]
> Ne partage JAMAIS ta `SERVICE_ROLE_KEY` publiquement (GitHub, forum, etc.). Elle donne un accès total à ta base de données sans RLS.
