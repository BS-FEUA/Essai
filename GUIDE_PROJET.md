# Guide du Projet BS-Lokossa (FEUA)

## 1. Application de Référence

L'application web canonique est développée dans `src/`. Son schéma de base de données est dans `prisma/schema.prisma` et sa base SQLite de développement réside dans `prisma/db/dev.db`.

Le dossier `Code/` est une ancienne version prototype conservée uniquement pour référence visuelle. **Toute nouvelle fonctionnalité doit être implémentée dans `src/`.**

---

## 2. Démarrage et Commandes Locales

### Prérequis
- **Node.js 20 LTS ou 22 LTS** (Windows PowerShell)

### Procédure de Lancement Local

1. Se placer à la racine du projet :
   ```powershell
   cd "D:\Document Pharel à protéger\Projet\Z.Ai"
   ```

2. Lancer le serveur de développement :
   ```powershell
   npm.cmd run dev
   ```
   L'application sera accessible sur **http://localhost:3000**.

### Comptes de Démonstration (Accès 1-Clic)

| Rôle | Email | Mot de Passe |
| --- | --- | --- |
| Super Admin (CEO) | `ceo@feua.bj` | `ceo2026` |
| Mast In | `mastin@feua.bj` | `mastin2026` |
| Mast | `mast@feua.bj` | `mast2026` |
| Master | `master@feua.bj` | `master2026` |
| Mix | `mix@feua.bj` | `mix2026` |
| Min | `min@feua.bj` | `min2026` |

---

## 3. Contrôles Qualité et Verification

Pour valider le typage et le build de l'application :

```powershell
# Vérification du typage TypeScript
npx.cmd tsc --noEmit

# Test de build de production
npm.cmd run build
```

---

## 4. Statut du Dossier `Code/`

Le dossier `Code/` doit être **conservé pour le moment** comme référence de style jusqu'à la validation définitive en production et l'exécution des tests d'acceptation utilisateur.
