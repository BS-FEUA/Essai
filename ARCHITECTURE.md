# Architecture de Référence Canonique — BS-Lokossa (FEUA)

L'unique application web canonique et de référence du Bureau Syndical de Lokossa est située dans le dossier racine **`src/`**.

Le dossier `Code/` est conservé temporairement comme archive visuelle de prototype. Il ne contient pas d'application active et ne doit pas recevoir de modifications.

---

## 1. Modules et Structure Canonique (`src/`)

```text
src/
├── app/
│   ├── page.tsx                    # Page d'accueil publique (Vitrine BS-Lokossa)
│   ├── (auth)/                     # Auth: Connexion, Inscription, Récupération
│   ├── (public)/landa/             # Espace Landa public
│   ├── (dashboard)/                # Espaces protégés (Dashboard, Membres, Documents, Caisses, Messagerie, Uniformes, Admin)
│   ├── api/                        # Routes API Next.js sécurisées (Auth, Members, Announcements, Uniforms, Cash, Audit)
│   └── proxy.ts                    # Proxy de sécurité et routage Next.js 16
├── components/
│   ├── ui/                         # Design System shadcn/ui réutilisable
│   ├── views/                      # Vues fonctionnelles (AdminView, MembersView, DocumentsView, CashView, UniformsView, etc.)
│   ├── layout/                     # En-têtes, barres latérales et mise en page
│   └── Modals/                     # Modales métier (Communiqués, Cotisations, Inscriptions)
├── lib/                            # Auth (JWT, cookies, hiérarchie), DB (Prisma SQLite), Store Zustand
└── types/                          # Définitions TypeScript
```

---

## 2. Niveaux d'Accès et Permissions (8 Niveaux)

La sécurité est appliquée côté serveur dans `src/lib/auth.ts` et dans les routes sous `src/app/api/` :

| Niveau | Nom | Description & Périmètre de Contrôle |
| --- | --- | --- |
| `CEO` | Super Administrateur | Contrôle total : suppression de comptes, modération, annulation de commandes d'uniformes, caisses, audit Mémoire H. |
| `MAST_IN` | Mast In | Administration interne, validation financière et consultation de l'audit. |
| `MAST` | Mast | Bureau exécutif : publication et édition de communiqués, validation des membres. |
| `MASTER` | Master | Validation des commandes d'uniformes (Niv 1), modération documentaire. |
| `MIX` | Mix | Membre du Bureau restreint. |
| `MIN` | Min | Membre actif avec accès personnel. |
| `AMC` | Ancien Membre | Accès archivé consultation uniquement. |
| `IGN` | Non Membre / Inactif | Aucun accès aux espaces protégés. |

---

## 3. Base de Données et Registre d'Audit

- **ORMs & BDD** : Prisma 6 avec base SQLite en développement (`file:./db/dev.db`).
- **Mémoire H (AuditLog)** : Registre immuable journalisant chaque création, suppression, connexion, changement de rôle et transaction financière.
