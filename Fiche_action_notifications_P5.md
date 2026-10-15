# Fiche d’action — Notifications (P5)

**Projet :** FEUA BS-Lokossa
**Étape actuelle :** fin de la configuration des notifications internes en temps réel ; préparation des notifications externes.
**Périmètre :** paiement documentaire exclu jusqu’à nouvel ordre.

## 1. État d’avancement

### Réalisé

- Messagerie et notifications internes reliées à l’application.
- Réception temps réel des messages et notifications, avec actualisation de secours.
- Contrôles des destinataires et du périmètre des messages côté API.
- Migration Supabase `004_messaging_realtime.sql` exécutée dans le SQL Editor. Le retour « Success. No rows returned » confirme son exécution sans erreur.
- Vérifications techniques effectuées sur le typage, le lint, les règles de messagerie et un parcours de notification.

### À faire

- Configurer un fournisseur d’envoi d’e-mails et brancher les e-mails utiles à l’application.
- Configurer WhatsApp pour les essais, puis prévoir l’accès de production.
- Configurer Firebase Cloud Messaging (FCM) pour les notifications navigateur.
- Ajouter les préférences de consentement et vérifier chaque canal de bout en bout.

## 2. Prochaine action — E-mail avec Resend

**À faire par l’administrateur du projet :**

1. Créer ou ouvrir le compte Resend.
2. Ajouter le domaine qui servira aux e-mails FEUA.
3. Publier dans la zone DNS les enregistrements SPF/DKIM indiqués par Resend, puis attendre la vérification du domaine.
4. Créer une clé API limitée à l’envoi et choisir l’adresse d’expéditeur, par exemple `FEUA <notifications@votredomaine.bj>`.
5. Ajouter la clé comme secret dans l’environnement de déploiement (local et/ou Vercel), sans la transmettre dans la conversation.

**À faire dans l’application après configuration :**

- Ajouter l’intégration serveur Resend et les modèles d’e-mails nécessaires.
- Définir les événements déclencheurs et éviter les envois en double.
- Envoyer un e-mail de test, puis vérifier réception, erreurs et adresse d’expéditeur.

**Point de reprise :** indiquer que le domaine est vérifié et communiquer l’adresse d’expéditeur souhaitée. Ne pas communiquer la clé API ; confirmer seulement qu’elle est configurée comme secret.

## 3. Étapes suivantes

### WhatsApp — environnement de test Twilio

- Activer le bac à sable WhatsApp Twilio et faire rejoindre au moins un numéro de test.
- Configurer les identifiants Twilio et le numéro WhatsApp d’essai comme secrets serveur.
- Brancher l’envoi et tester les cas succès/échec.
- Avant la production : enregistrer un expéditeur WhatsApp et valider les modèles de messages requis par Twilio/Meta.

### Notifications navigateur — Firebase Cloud Messaging

- Vérifier ou créer le projet Firebase et enregistrer l’application Web.
- Activer FCM, générer la clé Web Push et configurer le service worker.
- Configurer les valeurs publiques Firebase et les secrets d’administration côté serveur.
- Ajouter le stockage des abonnements/identifiants de navigateur et le consentement utilisateur.
- Tester l’autorisation, la réception au premier plan et la réception navigateur fermé lorsque le navigateur le permet.

## 4. Ordre recommandé et critères de fin

1. **Resend :** domaine vérifié, secret configuré, e-mail de test reçu.
2. **Twilio :** bac à sable rejoint, message de test reçu, erreurs gérées.
3. **FCM :** autorisation explicite, inscription navigateur conservée, push de test reçu.
4. **Validation P5 :** vérifier les préférences, les permissions, les journaux d’erreur et l’absence de doublons pour les trois canaux.

Chaque fournisseur nécessite des comptes et secrets qui appartiennent à l’organisation. Les clés privées et jetons restent dans les variables d’environnement ou le gestionnaire de secrets du déploiement, jamais dans le code ni dans la conversation.

## 5. Hors périmètre

- Paiement des documents et intégration FedaPay : suspendus jusqu’à nouvel ordre.
- Les notifications internes déjà en place ne nécessitent pas de rejouer la migration Supabase confirmée ci-dessus.
