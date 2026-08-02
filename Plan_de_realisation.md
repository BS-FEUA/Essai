# PLAN DE REALISATION

**FEDERATION DES ETUDIANTS UNIVERSITAIRES ASSOCIES**  
Bureau Syndical de Lokossa (BS-Lokossa)

## Application Web BS-Lokossa — Version corrigee

**Juillet a Novembre 2026 · 18 semaines · 10 phases**  
Next.js + React + Supabase + Vercel

*Corrections integrees v2.0 — Juillet 2026*

---

## 1. Passage a une application web

Cette version du plan adapte le projet BS-Lokossa d'une application mobile Flutter vers une application web Next.js / React. Toutes les fonctionnalites du cahier des charges sont conservees. Le backend Supabase reste identique. Cette version integre les corrections structurelles suivantes : phase P0 scindee en P0A (Infrastructure) et P0B (Architecture), tests de validation a la fin de chaque phase, Design System, documentation BDD et API, securite renforcee et strategie Git.

### 1.1 Avantages de l'application web pour BS-Lokossa

- Acces immediat : aucune installation requise, depuis n'importe quel navigateur (PC, telephone, tablette)
- Mises a jour instantanees : une modification deployee est visible par tous sans action de l'utilisateur
- Economies : 0 USD pour le deploiement (Vercel gratuit) contre 25 USD pour le Play Store mobile
- Equipe plus large : les developpeurs React/JS sont bien plus nombreux que les developpeurs Flutter/Dart
- PWA optionnelle : l'app web peut etre installee sur l'ecran d'accueil du telephone comme une vraie app
- Maintenance simplifiee : pas de versions APK, pas de validation externe

### 1.2 Stack technique adoptee

- Frontend : Next.js 14 (App Router) + React + TypeScript
- Styles : Tailwind CSS + shadcn/ui (composants prebuilt accessibles et reutilisables)
- Backend : Supabase (PostgreSQL + Auth JWT + Storage + Realtime) — identique a la version mobile
- Notifications push : Web Push API + Service Worker + Firebase Cloud Messaging web
- Paiement : FedaPay JavaScript SDK (MTN MoMo, Moov Money, carte bancaire)
- Hebergement : Vercel (gratuit pour Next.js) avec domaine personnalise
- Securite : Zod (validation), Rate Limiting, CSP, CORS, cookies HTTP-only, RLS Supabase
- Monitoring : Sentry (erreurs) + Vercel Analytics + Supabase Logs

### 1.3 Repartition des roles

- Developpeur Frontend 1 (Next.js / React / TypeScript) — pages, interfaces utilisateur, navigation, formulaires
- Developpeur Frontend 2 (React / TypeScript) — composants reutilisables, Design System, state management
- Developpeur Backend 1 (Supabase / SQL) — schema BDD, RLS, triggers PostgreSQL, Edge Functions
- Developpeur Backend 2 (Next.js / Securite) — API Routes, middleware, authentification, crons
- Developpeur Integration (Dev 5) — FedaPay SDK web, WhatsApp API, Web Push, SMTP, filigrane PDF

## 2. Planning detaille par phase

La phase P0 a ete scindee en deux sous-etapes : P0A (Infrastructure) et P0B (Architecture). Chaque phase inclut desormais des tests de validation en fin de phase, critere obligatoire avant de passer a la suivante.

| Phase | Nom | Dates (Duree) | Objectif |
| --- | --- | --- | --- |
| P0A | Infrastructure & Environnement | 20 – 26 Juillet 2026 (1 semaine) | Git + Next.js + Supabase + Vercel CI/CD + ESLint/Prettier. |
| P0B | Architecture & Design System | 27 Juillet – 2 Août 2026 (1 semaine) | Schema BDD + diagramme ER + Design System + architecture des routes. |
| P1 | Authentification & Niveaux d'acces | 3 – 16 Août 2026 (2 semaines) | Connexion web, WebAuthn (passkeys), 8 niveaux RLS, middleware routes. |
| P2 | Inscription & Gestion des membres | 17 Août – 6 Septembre 2026 (3 semaines) | Invitation email, formulaire inscription, validation Master, profil, transitions roles. |
| P3 | Gestion documentaire & Recherche | 7 – 20 Septembre 2026 (2 semaines) | Stockage documents, telechargement payant (2eme+), filigrane cote serveur, AMC. |
| P4 | Systeme de paiement & Caisses | 21 Septembre – 4 Octobre 2026 (2 semaines) | FedaPay SDK web (MoMo, Moov, carte), caisses virtuelles, retraits valides, recus PDF. |
| P5 | Messagerie & Notifications | 5 – 18 Octobre 2026 (2 semaines) | Messagerie temps reel, regles hierarchiques, Web Push, WhatsApp + email. |
| P6 | Commandes uniformes & Espace Landa | 19 – 25 Octobre 2026 (1 semaine) | Module uniforme membres (cycle + double validation) + page Landa sans compte. |
| P7 | Administration, Audit & Archivage | 26 Octobre – 8 Novembre 2026 (2 semaines) | Memoire H immuable, archivage annuel auto, transitions AMC/IGN, dashboard admin. |
| P8 | Tests, optimisation & deploiement | 9 – 22 Novembre 2026 (2 semaines) | Tests cross-navigateur + responsivite + PWA + deploiement Vercel + monitoring. |

## 3. Detail de chaque phase

Chaque phase est decrite avec ses taches par role, ses tests de fin de phase et ses livrables. Les tests de phase sont obligatoires avant de commencer la phase suivante.

### P0A — Infrastructure & Environnement

*Periode : 20 – 26 Juillet 2026 | Duree : 1 semaine*

Mise en place de toute l'infrastructure de developpement : depot Git, projet Next.js, connexion Supabase, pipeline CI/CD sur Vercel et configuration des outils qualite de code.

#### Taches par role

**Developpeur Frontend 1**

- Setup Next.js 14 (App Router + TypeScript strict) + Tailwind CSS + shadcn/ui
- Configuration ESLint + Prettier + conventions de code TypeScript

**Developpeur Frontend 2**

- Structure de dossiers Next.js : app/, components/, lib/, types/, hooks/

**Developpeur Backend 1**

- Creer projet Supabase (Auth, BDD PostgreSQL, Storage, Realtime)
- Variables d'environnement (.env.local) + secrets Vercel

**Developpeur Backend 2**

- Firebase Web SDK pour les notifications push navigateur

**Equipe**

- Depot Git + GitFlow simplifie (main / develop / feature/*)
- Configuration CI/CD sur Vercel depuis la branche develop
- Definition des environnements : dev local / staging / production
- Tests de smoke : verification deploiement automatique fonctionne

#### Livrables de cette phase :

- [x] Depot Git structure et workflows CI/CD actifs
- [x] Projet Next.js deploye sur Vercel (env. staging)
- [x] Supabase + Firebase configures et connectes

### P0B — Architecture & Design System

*Periode : 27 Juillet – 2 Août 2026 | Duree : 1 semaine*

Conception de l'architecture technique complete : schema de base de donnees avec diagramme entite-association, dictionnaire de donnees, Design System (composants reutilisables), et architecture des routes protegees.

> **Ce travail d'architecture realise en P0B evite de reprendre la structure BDD ou les composants au milieu du developpement. Ne pas sauter cette etape.**

#### Taches par role

**Developpeur Frontend 1**

- Design System : composants reutilisables (Button, Input, Modal, Table, Badge, Pagination, Toast, Skeleton)
- Theme couleurs FEUA + typographie + espacements (tokens Tailwind)

**Developpeur Frontend 2**

- Charte graphique responsive validee (desktop / tablette / mobile)

**Developpeur Backend 1**

- Schema BDD complet : members, roles, documents, caisses, messages, uniforms, audit_log
- Diagramme Entite-Association (ER) via dbdiagram.io

**Developpeur Backend 2**

- Dictionnaire de donnees : types, contraintes, index, cles etrangeres, vues SQL
- Politiques RLS pour les 8 niveaux d'acces + tests d'acces croise

**Equipe**

- Architecture des routes Next.js App Router (routes protegees par middleware)
- Documentation API Routes : parametres, reponses JSON, codes d'erreur, permissions
- Convention de nommage BDD + API + composants validee par l'equipe

#### Livrables de cette phase :

- [x] Schema BDD valide + diagramme ER documente
- [x] Design System de base (8+ composants)
- [x] Architecture routes + conventions documentees

### P1 — Authentification & Niveaux d'acces

*Periode : 3 – 16 Août 2026 | Duree : 2 semaines*

Systeme de connexion web complet : formulaire email/mot de passe, WebAuthn (passkeys) pour l'equivalent de la biometrie, code de recuperation (8 min), protection des routes par middleware Next.js.

#### Taches par role

**Developpeur Frontend 1**

- Page d'accueil : choix Membre FEUA / Etudiant Landa + bandeau communiques defilant
- Formulaire de connexion web (email + mot de passe) + WebAuthn / Passkeys

**Developpeur Frontend 2**

- Page de recuperation de compte (code email, expiration 8 minutes)
- Page connexion AMC (email + mot de passe initial, acces restreint)

**Developpeur Backend 1**

- Supabase Auth : JWT + cookies HTTP-only securises
- Middleware Next.js (middleware.ts) : protection des routes selon le role
- RLS complet pour les 8 niveaux (CEO → AMC) + tests d'acces

**Developpeur Backend 2**

- Expiration session 24h (Min/Mix/Master), prolongee pour Mast/Mast In
- Blocage apres 5 tentatives + envoi code de recuperation

**Equipe (Tests de fin de phase)**

- Tests securite : XSS, CSRF, brute force, injection SQL
- Tests cross-navigateur : Chrome, Firefox, Safari, Edge
- Tests de connexion pour chacun des 8 niveaux (droits reels)
- Tests middleware : tentative d'acces non autorise → redirection correcte

#### Livrables de cette phase :

- [x] Connexion web fonctionnelle (8 niveaux)
- [x] WebAuthn (passkeys) operationnel
- [x] RLS implemante et teste
- [x] Tests de securite auth passes

### P2 — Inscription & Gestion des membres

*Periode : 17 Août – 6 Septembre 2026 | Duree : 3 semaines*

Flow complet d'invitation email, formulaire d'inscription web (15+ champs), validation par Master, interface profil membre, archive Donnees indiscipline et transitions de roles.

#### Taches par role

**Developpeur Frontend 1**

- Flow invitation : Master saisit email + telephone → lien envoye automatiquement
- Formulaire inscription web multi-etapes (matricule, filiere, entite, date de naissance, photo...)

**Developpeur Frontend 2**

- Interface profil membre (tableau de bord) + interface admin Master (liste, recherche, modifier)
- Barre de recherche globale (membres actifs + archives) avec filtres

**Developpeur Backend 1**

- Email d'invitation automatique via SMTP (Resend ou Nodemailer)
- Notification Master + email confirmation post-validation
- Archive "Donnees indiscipline" lors de la suppression d'un compte

**Developpeur Backend 2**

- Logique transitions de niveaux + verification unicite matricule/email
- Validation Zod cote serveur pour tous les formulaires

**Equipe (Tests de fin de phase)**

- Tests du cycle complet d'inscription bout en bout
- Verification des regles de transition (tableau §2.2 du CDC)
- Tests de charge : 10 inscriptions simultanees → pas de doublon
- Tests validation Zod : champs invalides, injection tentee

#### Livrables de cette phase :

- [x] Inscription bout en bout fonctionnelle
- [x] Profils membres complets
- [x] Transitions de roles testees
- [x] Validation Zod cote serveur

### P3 — Gestion documentaire & Recherche

*Periode : 7 – 20 Septembre 2026 | Duree : 2 semaines*

Stockage securise des documents via Supabase Storage (protege par RLS), telechargement gratuit pour le 1er puis payant (500 FCFA minimum), filigrane numerique cote serveur et espace AMC.

#### Taches par role

**Developpeur Frontend 1**

- Upload carte etudiante (PDF/image) + fiche pre-inscription via formulaire web
- Interface "Mes documents" : liste, apercu, telechargement

**Developpeur Frontend 2**

- Interface AMC : archives consultables + telechargement payant
- Barre recherche avancee par nom, matricule, annee + export CSV/PDF

**Developpeur Backend 1**

- Supabase Storage avec signed URLs (acces securise et temporaire, RLS par membre)
- Compteur telechargements : 1er gratuit, 500 FCFA minimum a partir du 2eme

**Developpeur Backend 2**

- API Route export liste membres (CSV/PDF)

**Developpeur Integration (Dev 5)**

- Filigrane numerique cote serveur (sharp.js pour images, pdf-lib pour PDF) : nom + matricule
- Lien paiement conditionnel avant 2eme telechargement
- Recu auto-genere et envoye par email + WhatsApp pour les AMC

**Equipe (Tests de fin de phase)**

- Tests telechargement : 1er gratuit (OK), 2eme bloque (redirect paiement)
- Tests filigrane : lisibilite, positionnement, cas limite (noms longs)
- Tests acces croise : un membre ne peut pas acceder aux docs d'un autre

#### Livrables de cette phase :

- [x] Stockage documents securise (RLS)
- [x] Filigrane cote serveur operationnel
- [x] Interface AMC fonctionnelle
- [x] Tests d'acces croise passes

### P4 — Systeme de paiement & Caisses

*Periode : 21 Septembre – 4 Octobre 2026 | Duree : 2 semaines*

Integration FedaPay via SDK web (MTN MoMo, Moov Money, carte Visa/Mastercard), gestion des caisses virtuelles multi-services, flux de validation des retraits TG/TGA et recus PDF automatiques.

> **ATTENTION : Faire la demande d'activation du compte marchand FedaPay des la semaine 1 (delai de 3 a 7 jours ouvrables). Ne pas attendre P4.**

#### Taches par role

**Developpeur Frontend 1**

- Page paiement web (MTN MoMo, Moov Money, carte) via FedaPay Checkout
- Dashboard soldes caisses (Master, Mast, Mast In) + interface retrait TG/TGA

**Developpeur Frontend 2**

- Page bilan comptable avec filtres par periode

**Developpeur Backend 1**

- Gestion multi-caisses virtuelles (principale, uniformes, services numeriques)
- Flux validation retrait : TG/TGA soumet → Mast In valide (Supabase Realtime)

**Developpeur Backend 2**

- Webhook FedaPay : confirmation paiement cote serveur
- Import document budgetaire (Excel/PDF) + bilan comptable automatique

**Developpeur Integration (Dev 5)**

- FedaPay JavaScript SDK + API Routes Next.js securisees
- Generation recu PDF cote serveur (pdf-lib ou Puppeteer)
- Envoi automatique recu par email + WhatsApp

**Equipe (Tests de fin de phase)**

- Tests paiement sandbox : MoMo, Moov, carte (succes + echec + timeout)
- Tests flux retrait : TG soumet → Mast In valide → notification temps reel
- Tests webhook : signature FedaPay, idempotence (doublon)
- Verification recus PDF : contenu correct, envoi email + WhatsApp

#### Livrables de cette phase :

- [x] Paiement web operationnel (sandbox valide)
- [x] Caisses multi-services gerees
- [x] Recus PDF envoyes automatiquement
- [x] Tous les tests paiement passes

### P5 — Messagerie & Notifications

*Periode : 5 – 18 Octobre 2026 | Duree : 2 semaines*

Messagerie pleniere et privee avec regles hierarchiques (Min-Min bloque), notifications push navigateur via Web Push API, et canaux externes WhatsApp Business API et email SMTP.

> **ATTENTION : Entamer la verification du compte Meta Business des la semaine 3 (delai jusqu'a 2 semaines). En attendant, utiliser le sandbox Twilio WhatsApp pour les tests.**

#### Taches par role

**Developpeur Frontend 1**

- UI messagerie pleniere (Acces All, lecture + ecriture, temps reel)
- UI messagerie privee : regles hierarchiques (§4.6 du CDC)

**Developpeur Frontend 2**

- Centre notifications in-app + bandeau defilant communiques

**Developpeur Backend 1**

- Supabase Realtime : canaux messages temps reel + logique blocage Min-Min et Mix-Mix
- Service Worker (sw.js) + Web Push API + FCM Web SDK

**Developpeur Backend 2**

- Fonction relance globale CEO : re-notification membres sans fiche soumise

**Developpeur Integration (Dev 5)**

- WhatsApp Business API (Twilio ou Infobip)
- Email SMTP (Resend) pour convocations et communiques
- Facebook Messenger via Meta Graph API (optionnel)
- Canaux actifs meme si la page est fermee (Service Worker en arriere-plan)

**Equipe (Tests de fin de phase)**

- Tests messagerie temps reel (envoi, reception, persistance)
- Tests blocage hierarchique (tous les cas du tableau §4.6)
- Tests push navigateur (Chrome, Firefox, Edge)
- Tests WhatsApp sandbox + email : reception, contenu correct

#### Livrables de cette phase :

- [x] Messagerie temps reel fonctionnelle
- [x] Web Push notifications operationnel
- [x] Regles hierarchiques testees et validees
- [x] WhatsApp + email operationnels (sandbox)

### P6 — Commandes uniformes & Espace Landa

*Periode : 19 – 25 Octobre 2026 | Duree : 1 semaine*

Module de commande d'uniforme pour membres (cycle annuel avec double validation Master) et page web publique pour les etudiants landa sans creation de compte.

#### Taches par role

**Developpeur Frontend 1**

- Module commande uniforme : bouton cyclique (1ere / 2eme / Neme annee) + recap admin

**Developpeur Frontend 2**

- Page publique Espace Landa (route non protegee) + formulaire complet (upload recu, CGU)

**Developpeur Backend 1**

- Logique cycle commande BDD (etats : en_attente → val1 → val2 → livre)

**Developpeur Backend 2**

- Comptage automatique via requete SQL COUNT (pas d'IA requise)

**Developpeur Integration (Dev 5)**

- Notifications multi-canaux Landa quand uniforme pret (email + WhatsApp + Facebook)
- Recu numerique avec numero d'identification unique a la soumission

**Equipe (Tests de fin de phase)**

- Tests cycle commande complet (3 cycles successifs)
- Tests Espace Landa : soumission, paiement, reception recu, notification ready
- Tests acces : page Landa accessible sans connexion, protegee correctement

#### Livrables de cette phase :

- [x] Commandes membres fonctionnelles (3 cycles testes)
- [x] Espace Landa public operationnel
- [x] Notifications Landa multi-canaux
- [x] Tests P6 passes

### P7 — Administration, Audit & Archivage

*Periode : 26 Octobre – 8 Novembre 2026 | Duree : 2 semaines*

Memoire H (journal PostgreSQL immuable et horodate), archivage automatique annuel, regles de transition de statut (3 ans→AMC, IGN +2 ans) et dashboard administrateur pour le Mast In.

> **IMPORTANT : La Memoire H doit etre immuable des la creation. Politique RLS PostgreSQL WITH CHECK (false) sur UPDATE et DELETE. Meme le CEO ne peut pas modifier les entrees.**

#### Taches par role

**Developpeur Frontend 1**

- Dashboard Memoire H (CEO + Mast In seulement) : tableau filtre, tri par date/acteur/action
- Interface archives par annee scolaire (lecture seule) + dashboard statistiques Mast In

**Developpeur Frontend 2**

- Extraction et export coordonnees (email/tel) par niveau d'acces

**Developpeur Backend 1**

- Memoire H : table PostgreSQL append-only (RLS WITH CHECK (false) sur UPDATE/DELETE)
- Triggers archivage automatique fin d'annee + regle 3 ans → AMC (cron Edge Function)

**Developpeur Backend 2**

- Extension IGN (+2 ans) + blocage membres sans fiche + messages Felicitations/Du courage
- Anti-doublon totaux cumules inter-archives + sauvegardes automatiques Supabase

**Equipe (Tests de fin de phase)**

- Tests immuabilite Memoire H : modifier/supprimer → erreur pour tous les niveaux (CEO inclus)
- Tests transitions AMC et IGN sur donnees realistes
- Tests archivage : archive correcte, acces lecture seule uniquement
- Tests sauvegardes : restauration d'une archive

#### Livrables de cette phase :

- [x] Memoire H immuable (tests passes pour tous niveaux)
- [x] Archivage annuel automatise et teste
- [x] Dashboard admin complet
- [x] Sauvegardes automatiques configurees

### P8 — Tests, optimisation & deploiement

*Periode : 9 – 22 Novembre 2026 | Duree : 2 semaines*

Tests unitaires et d'integration, tests de responsivite, beta test terrain avec membres FEUA, configuration PWA, deploiement sur Vercel avec domaine personnalise et monitoring de production.

#### Taches par role

**Developpeur Frontend 1**

- Tests responsivite : mobile (375px), tablette (768px), desktop (1280px+) + corrections
- Configuration PWA : manifest.json + Service Worker + installation ecran d'accueil

**Developpeur Frontend 2**

- Optimisation Core Web Vitals : Lighthouse score > 85, next/image, code splitting

**Developpeur Backend 1**

- Tests integration flux critiques (auth, paiement, archivage)
- Audit securite : RLS exhaustif, cookies HTTP-only, headers CSP/CORS, Rate Limiting

**Developpeur Backend 2**

- Conformite APDP (loi beninoise protection donnees) + HTTPS/TLS 1.3 production

**Equipe**

- Tests cross-navigateur (Chrome, Firefox, Safari, Edge) avec Playwright ou manuel
- Beta test avec 5 a 10 membres FEUA (desktop + mobile) + correction bugs prioritaires
- Configuration Sentry (error tracking) + Vercel Analytics + alertes uptime
- Deploiement Vercel production + domaine personnalise + guide utilisateur + formation equipe

#### Livrables de cette phase :

- [x] Application web deployee sur Vercel (production)
- [x] PWA installable sur mobile
- [x] Rapport de tests final valide
- [x] Monitoring Sentry + Analytics actifs
- [x] Equipe BS-Lokossa formee

## 4. Inventaire complet des outils IA gratuits

Inventaire de tous les outils d'intelligence artificielle gratuits utilisables pour realiser le projet BS-Lokossa. Organise par categorie de besoin pour faciliter le choix selon la tache a accomplir. La plupart ont un plan gratuit suffisant pour toute la duree du projet (juillet a novembre 2026).

> **IMPORTANT : Ces outils sont complementaires. Un developpeur utilisera typiquement 3 a 4 outils en parallele selon la nature de la tache. La strategie recommandee est presentee en section 4.9.**

### 4.1 1 — Assistants IA polyvalents

Outils d'IA conversationnels utilisables pour generer du code, expliquer des concepts, ecrire de la documentation ou deboguer des problemes complexes.

| Outil | Description | Plan gratuit | Usage pour BS-Lokossa |
| --- | --- | --- | --- |
| Claude (claude.ai) | IA generative Anthropic, excellente pour le code complexe, l'architecture et la documentation longue. | Oui — plan gratuit avec limites quotidiennes (Claude Sonnet) | Architecture Next.js, code complexe, politiques RLS, revue de code, documentation technique |
| ChatGPT (GPT-4o) | IA OpenAI tres repandue, polyvalente pour le code et l'explication de concepts. | Oui — GPT-4o avec limites quotidiennes, GPT-3.5 illimite | Generation de code, debug, questions rapides, explication d'algorithmes |
| Google Gemini | IA Google avec acces au web en temps reel. Tres integree avec l'ecosysteme Google. | Oui — Gemini 1.5 Pro limite, Gemini 1.0 Pro plus libre | Firebase, APIs Google, recherche avec sources recentes, integrations Cloud |
| Mistral Le Chat | IA europeenne performante, bonne en raisonnement logique et code structure. | Oui — acces web illimite sur chat.mistral.ai | Code technique, raisonnement, alternatives a Claude/ChatGPT |
| DeepSeek | IA chinoise tres performante sur les taches de code, comparable a GPT-4. | Oui — acces web illimite sur deepseek.com | Code complexe, algorithmes, generation de code TypeScript/SQL |
| Meta AI (Llama 3) | IA Meta accessible directement dans WhatsApp, Facebook et Instagram. | Oui — sans limite connue | Questions rapides, integration naturelle WhatsApp pour tester des prompts |

### 4.2 2 — IDE et assistants de code integres

Environnements de developpement ou extensions qui integrent l'IA directement dans l'editeur de code pour l'autocompletion et le refactoring.

| Outil | Description | Plan gratuit | Usage pour BS-Lokossa |
| --- | --- | --- | --- |
| Windsurf (Codeium) | IDE base sur VSCode avec IA profondement integree. Comprend tout le codebase du projet. | Oui — plan gratuit tres liberal, sans limite stricte | Developpement Next.js au quotidien, refactoring, generation de composants React |
| Cursor | IDE fork de VSCode avec IA integree. Permet de "chatter" avec tout le codebase. | Oui — 150 requetes/mois gratuites | Questions sur le codebase complet, navigation, comprendre des erreurs complexes |
| GitHub Copilot | Autocompletion de code en temps reel, integree dans VS Code et autres IDE. | Oui — gratuit pour etudiants via GitHub Education Pack | Autocompletion TypeScript/React, generation de fonctions, tests unitaires |
| Codeium (extension) | Extension d'autocompletion IA legere, compatible avec VS Code, JetBrains, Vim. | Oui — illimite sur le plan gratuit | Autocompletion rapide, alternative gratuite a Copilot sans limite d'essai |
| Blackbox AI | IA specialisee dans la generation et l'extraction de code depuis n'importe quelle source. | Oui — plan de base gratuit | Generer des snippets rapides, convertir du pseudo-code en TypeScript |
| Amazon Q Developer | Assistant IA AWS pour le code, avec analyse de securite integree. | Oui — tier gratuit individuel sans carte requise | Analyse de vulnerabilites dans le code Next.js, suggestions securite |
| Tabnine | Autocompletion IA disponible sur la plupart des IDE. | Oui — plan de base gratuit (modele local) | Complement d'autocompletion si Codeium ou Copilot ne sont pas disponibles |

### 4.3 3 — Generation d'interfaces UI (React / Next.js)

Outils specialises pour generer des composants React et des pages Next.js directement exploitables dans le projet, avec Tailwind CSS.

| Outil | Description | Plan gratuit | Usage pour BS-Lokossa |
| --- | --- | --- | --- |
| v0.dev (Vercel) | Genere des composants React + Tailwind CSS directement reutilisables dans Next.js. Ideal pour prototyper des UI complexes. | Oui — quota mensuel gratuit (relance chaque mois) | Formulaires, tableaux de bord, messagerie, pages admin, composants complexes |
| Bolt.new (StackBlitz) | Genere des applications web completes en quelques secondes depuis une description. | Oui — quota quotidien gratuit | Prototyper rapidement une nouvelle fonctionnalite avant de l'integrer dans le projet |
| Lovable.dev | Genere des applications React full-stack avec logique et UI en une seule description. | Oui — 5 projets par mois | Prototyper des ecrans complets (tableau de bord Mast In, messagerie, Espace Landa) |
| Uizard | Outil de prototypage rapide avec IA, permet de transformer une image en UI. | Oui — 2 projets sur le plan gratuit | Creer des wireframes et maquettes des ecrans principaux avant le developpement |
| Galileo AI | Genere des maquettes UI depuis une description textuelle. | Acces gratuit limite (liste d'attente) | Generer des concepts visuels d'ecrans complexes a valider avec l'equipe |

### 4.4 4 — Base de donnees et SQL

Outils IA specialises dans la conception de schemas, la generation de requetes SQL et la gestion des politiques de securite en base de donnees.

| Outil | Description | Plan gratuit | Usage pour BS-Lokossa |
| --- | --- | --- | --- |
| Supabase AI (integre) | Assistant SQL directement dans l'editeur Supabase. Genere des tables, des politiques RLS et des Edge Functions. | Oui — integre a la plateforme Supabase (plan gratuit) | Creer les tables, ecrire les politiques RLS, optimiser les requetes, generer les triggers |
| AI2sql.io | Convertit des descriptions en langage naturel en requetes SQL optimisees. | Oui — 10 requetes par jour (sans compte) | Generer des requetes complexes (ex: stats membres par institution par annee scolaire) |
| Chat2DB | IDE de base de donnees avec assistant IA integre pour explorer et optimiser la BDD. | Oui — plan open source gratuit | Explorer la base Supabase, optimiser les requetes lentes, analyser les index |
| dbdiagram.io | Outil de creation de diagrammes ER (Entite-Association) depuis un schema textuel DBML. | Oui — illimite pour les diagrammes publics | Creer et partager le diagramme ER du projet BS-Lokossa (obligatoire en P0B) |
| DrawSQL | Conception visuelle de schemas de bases de donnees avec export SQL. | Oui — plan gratuit avec 1 schema | Modeliser la BDD visuellement et exporter le SQL initial pour Supabase |

### 4.5 5 — Recherche technique et documentation

Moteurs de recherche specialises dans les questions de developpement, avec sources verifiees et exemples de code.

| Outil | Description | Plan gratuit | Usage pour BS-Lokossa |
| --- | --- | --- | --- |
| Perplexity AI | Moteur de recherche IA avec citations. Repond aux questions techniques avec des sources recentes. | Oui — plan gratuit avec acces au web | Integrer FedaPay en Next.js, WhatsApp Business API, WebAuthn, Supabase Realtime |
| Phind | Moteur de recherche specialise pour les developpeurs. Repond avec du code et des explications. | Oui — illimite (modele Phind-70B) | Erreurs Next.js/TypeScript, solutions Supabase, patterns React courants |
| You.com (YouCode) | Moteur de recherche avec assistant IA et mode code dedie. | Oui — acces de base gratuit | Recherche de bibliotheques npm, documentation APIs, exemples de code |
| Devv.ai | Moteur de recherche IA dedie aux developpeurs, avec indexation de GitHub. | Oui — illimite | Questions techniques precises avec exemples du code open source pertinents |
| Mintlify Writer | Genere automatiquement de la documentation a partir du code source. | Oui — plan gratuit pour documentation publique | Generer la documentation des API Routes et des composants du projet |

### 4.6 6 — Tests et qualite de code

Outils d'analyse statique, de tests automatises et de qualite de code avec assistance IA.

| Outil | Description | Plan gratuit | Usage pour BS-Lokossa |
| --- | --- | --- | --- |
| Snyk (ex-DeepCode) | Analyse de securite du code avec IA. Detecte les vulnerabilites en temps reel. | Oui — gratuit pour projets open source, 200 tests/mois sinon | Detecter les failles dans le code Next.js, les dependances npm vulnerables |
| SonarCloud | Analyse statique de qualite du code : bugs, code smells, couverture des tests. | Oui — gratuit pour projets publics GitHub | Maintenir la qualite du code tout au long du projet, integre dans la CI/CD |
| Playwright (IA-assisted) | Framework de tests E2E (end-to-end) avec generation de tests via IA (Copilot/Cursor). | Oui — open source gratuit | Tests cross-navigateur automatises (Chrome, Firefox, Safari, Edge) en P8 |
| CodeClimate | Analyse de maintenabilite et de complexite du code. | Oui — gratuit pour depots publics | Surveiller la dette technique tout au long du projet |
| GitHub Actions | CI/CD avec workflows IA-generes (via Copilot) pour automatiser les tests. | Oui — 2000 minutes/mois pour depots prives | Executer automatiquement les tests a chaque pull request (lint, build, tests) |

### 4.7 7 — Design et prototypage

Outils de conception visuelle avec fonctionnalites IA pour creer des maquettes, des icones et des visuels pour l'application.

| Outil | Description | Plan gratuit | Usage pour BS-Lokossa |
| --- | --- | --- | --- |
| Figma (plan gratuit) | Outil de design collaboratif de reference. Le plan gratuit inclut 3 projets actifs. | Oui — 3 fichiers actifs, collaborateurs illimites | Maquettes haute fidelite des ecrans BS-Lokossa avant developpement |
| Excalidraw | Outil de diagrammes informels (style dessin a la main). Open source. | Oui — illimite, sans compte | Diagrammes d'architecture rapides, flows utilisateur, schemas de BDD informels |
| Canva AI | Creation de visuels avec IA generative pour icones, illustrations et presentatins. | Oui — plan gratuit avec acces limite aux fonctions IA | Icones de l'application, visuels pour les communiques FEUA, presentation du projet |
| Framer | Outil de prototypage interactif avec IA pour animer les composants. | Oui — plan gratuit (branding Framer visible) | Prototypes interactifs des ecrans de connexion ou du tableau de bord |
| Icons8 / Iconify | Bibliotheques d'icones avec assistant de recherche IA. | Oui — milliers d'icones gratuites | Icones de l'application (membres, documents, caisses, notifications...) |

### 4.8 8 — Monitoring, erreurs et observabilite

Outils de surveillance de l'application en production pour detecter les erreurs, analyser les performances et suivre les comportements utilisateurs.

| Outil | Description | Plan gratuit | Usage pour BS-Lokossa |
| --- | --- | --- | --- |
| Sentry | Error tracking en temps reel pour JavaScript/Next.js. Capture les erreurs avec contexte complet. | Oui — 5 000 evenements/mois, 1 projet | Detecter et corriger les erreurs JavaScript en production apres le deploiement P8 |
| Vercel Analytics | Analytics integres a Vercel : visiteurs, Core Web Vitals, performance par page. | Oui — integre a Vercel sans configuration | Suivre les performances et l'usage de l'application BS-Lokossa |
| Highlight.io | Session replay + logs + erreurs. Permet de revivre exactement ce que l'utilisateur a vu. | Oui — 500 sessions + 1000 erreurs/mois | Comprendre les bugs UX signales par les membres FEUA en production |
| Uptime Robot | Surveillance de la disponibilite (uptime) du site avec alertes email/SMS. | Oui — 50 moniteurs, verifications toutes les 5 min | Etre alerte immediatement si l'application BS-Lokossa devient indisponible |
| Supabase Logs | Journaux d'acces et d'erreurs integres a Supabase (Auth, BDD, Storage, Edge Functions). | Oui — 1 heure de logs sur le plan gratuit, 7 jours sur Pro | Surveiller les erreurs de base de donnees, les echecs d'auth, les requetes lentes |

### 4.9 Strategie d'usage recommandee

Combinaison optimale selon la tache en cours :

- Developpement Next.js au quotidien → Windsurf ou Cursor (voient tout le projet) + GitHub Copilot (autocompletion)
- Probleme d'architecture ou blocage complexe → Claude (raisonnement long) ou ChatGPT
- Prototyper un nouvel ecran rapidement → v0.dev (composants React+Tailwind directement utilisables)
- Integrer une API externe (FedaPay, WhatsApp) → Perplexity (recherche sources) puis Claude (adapter le code)
- Base de donnees et SQL → Supabase AI (dans l'editeur) + AI2sql.io (requetes complexes)
- Detecter une vulnerabilite ou un bug de securite → Snyk + Amazon Q Developer
- Surveiller la production apres deploiement → Sentry + Vercel Analytics + Uptime Robot
- Creer des maquettes pour valider un ecran → Figma (plan gratuit) + Excalidraw (schemas rapides)

## 5. Bonnes pratiques techniques

Regles et recommandations techniques a respecter tout au long du projet pour garantir la qualite, la securite et la maintenabilite de l'application BS-Lokossa.

### 5.1 Architecture de la base de donnees

- Creer le diagramme Entite-Association (ER) via dbdiagram.io avant tout developpement (obligation P0B)
- Rediger un dictionnaire de donnees : type, contrainte, description, valeurs possibles pour chaque colonne
- Definir les index sur les colonnes tres requetees (matricule, email, niveau_acces, institution)
- Nommer les tables en snake_case pluriel : members, audit_logs, cash_transactions, uniform_orders
- Toutes les tables doivent avoir un champ id (uuid), created_at et updated_at (timestamps auto)
- Les cles etrangeres doivent avoir une contrainte ON DELETE (CASCADE ou SET NULL selon le cas)

### 5.2 Documentation des API Routes

- Chaque API Route Next.js doit etre documentee : methode HTTP, parametres, reponse JSON, codes d'erreur
- Utiliser Zod pour valider les donnees entrantes de chaque route (schema strict cote serveur)
- Les routes protegees verifient le token Supabase Auth en debut de fonction (getServerSession ou createServerClient)
- Retourner des codes HTTP semantiques : 200 (OK), 201 (cree), 400 (invalide), 401 (non auth), 403 (interdit), 404 (introuvable), 500 (erreur serveur)
- Documenter les permissions : quel niveau d'acces peut appeler chaque route

### 5.3 Design System

- Creer les composants de base des P0B : Button, Input, Textarea, Select, Modal, Table, Badge, Pagination, Toast, Skeleton, Avatar
- Definir les tokens Tailwind dans tailwind.config.ts : couleurs FEUA, espacements, rayon de bordure, ombres
- Chaque composant doit etre accessible (aria-label, role, focus visible) et responsive
- Documenter chaque composant avec ses props TypeScript et ses cas d'usage (Storybook optionnel)
- Ne jamais dupliquer un composant : tout element reutilisable va dans components/ui/ et est importe

### 5.4 Securite renforcee

- Rate Limiting : limiter les routes publiques (login, inscription, paiement) avec upstash/ratelimit ou similaire
- Content Security Policy (CSP) : configurer les headers dans next.config.js pour bloquer XSS
- Validation Zod : valider TOUTES les donnees entrantes cote serveur (ne jamais faire confiance au client)
- Sauvegardes automatiques : activer les sauvegardes quotidiennes Supabase (plan Pro) ou exporter manuellement chaque semaine
- Journalisation centralisee : tous les appels API Routes sont loggues (Supabase Logs + Sentry)
- Surveillance des performances : activer Vercel Speed Insights pour detecter les pages lentes

### 5.5 Strategie Git (GitFlow simplifie)

- Branches principales : main (production) et develop (integration)
- Branches de fonctionnalite : feature/nom-de-la-feature (ex: feature/auth-webauthn)
- Branches de correctif : fix/description-du-bug (ex: fix/upload-photo-timeout)
- Pull Requests obligatoires : toute modification de develop ou main passe par une PR avec revue de code
- Convention de commits : "type(scope): message" — ex: feat(auth): add WebAuthn support
- Tags de version : taguer chaque fin de phase (ex: v0.1.0-P0B, v0.2.0-P1, ..., v1.0.0-P8)

### 5.6 Monitoring et observabilite en production

- Sentry : integrer des P8 pour capturer toutes les erreurs JavaScript Next.js en production
- Vercel Analytics : activer pour suivre les Core Web Vitals et le trafic des pages
- Supabase Logs : consulter regulierement les logs Auth (echecs connexion), BDD (requetes lentes) et Edge Functions
- Uptime Robot : configurer un moniteur sur l'URL de production (alerte email si site tombe)
- Alertes Sentry : configurer des notifications Slack ou email pour les erreurs critiques en production

## 6. Risques et points d'attention

Risques specifiques a l'application web, avec leurs mitigations. Un nouveau risque a ete ajoute par rapport a la version initiale : l'absence de tests par phase.

| Risque | Description | Mitigation |
| --- | --- | --- |
| Web Push sur iOS Safari | Les notifications push Web ne sont supportees sur iPhone que depuis iOS 16.4 (2023) et restent limitees. | Privilegier WhatsApp + email comme canaux principaux sur iOS. Indiquer la compatibilite requise. |
| Delai activation APIs externes | FedaPay (compte marchand) et WhatsApp Business (verification Meta) peuvent prendre jusqu'a 2 semaines. | Lancer les demandes des la semaine 1, en parallele de P0A. |
| SEO et securite des routes | En Next.js App Router, une route mal configuree peut exposer des donnees protegees. | Tester le middleware.ts rigoureusement. Valider chaque route avec un compte Min et sans connexion. |
| Conformite APDP | La loi beninoise impose une politique de confidentialite acceptee lors de l'inscription. | Rediger la politique en P0B, l'integrer dans le formulaire en P2. |
| Memoire H modifiable | Si creee comme table ordinaire, les entrees pourraient etre modifiees accidentellement. | Politique RLS PostgreSQL WITH CHECK (false) sur UPDATE et DELETE des la creation en P0B. |
| Performance sur connexion lente | Les etudes en Benin se font souvent sur des connexions 3G/4G variables. | next/image, cache HTTP, ISR/SSG pour pages statiques, test Chrome DevTools en 3G lente. |
| Absence de tests par phase | Sans tests a chaque phase, les bugs s'accumulent et deviennent difficiles a corriger en P8. | Executer les tests de fin de phase avant de demarrer la phase suivante (critere de passage obligatoire). |

### 6.1 Note sur la PWA (Progressive Web App)

La configuration PWA en P8 permet aux membres d'installer l'application web sur l'ecran d'accueil de leur telephone. Sur Android (Chrome), l'experience est tres proche d'une app native. Sur iPhone (Safari), les notifications push restent limitees (iOS 16.3 et anterieur ne les supportent pas). La PWA est optionnelle : l'app fonctionne parfaitement sans elle, directement dans le navigateur.

### 6.2 Priorites en cas de retard

- Indispensables au lancement : P0A, P0B, P1 (Auth), P2 (Membres), P4 (Paiements), P6 (Uniformes)
- Peuvent etre simplifies : P3 (filigrane reportable), P5 (Facebook Messenger optionnel)
- Reportables apres v1 : PWA (P8), archivage auto P7 (declenchable manuellement), dashboard avance

---

*FEUA / BS-Lokossa · Plan de realisation Web v2.0 corrige · Juillet 2026*
