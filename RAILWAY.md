# Déployer TropiShop sur Railway

Guide pour mettre l’app en ligne 24/7 sur [Railway](https://railway.app).  
La base est en **PostgreSQL** (service Railway) : **plus de perte de données** aux redéploiements.

## 1. Préparer le dépôt

- Pousse le projet sur **GitHub** (ou GitLab).
- Vérifie que ton `.env` n’est **pas** commité (dans `.gitignore`).

## 2. Créer un projet Railway

1. Va sur [railway.app](https://railway.app) et connecte-toi (GitHub).
2. **New Project** → **Deploy from GitHub repo**.
3. Choisis ton repo (ex. `AurelMarket`). Railway crée un service (ton app).

## 3. Ajouter PostgreSQL (base qui ne se perd plus)

1. Dans le **même projet** Railway, ouvre la **palette** : **Ctrl+K** (ou **Cmd+K**).
2. Choisis **« Add PostgreSQL »** (ou **« New » → « Database » → « PostgreSQL »**).
3. Railway crée un **service PostgreSQL** et lui génère une **variable `DATABASE_URL`**.
4. **Connecter la base à ton app** :
   - Clique sur le service **PostgreSQL** → onglet **Variables** (ou **Connect**).
   - Tu vois **`DATABASE_URL`** (ex. `postgresql://postgres:xxx@xxx.railway.app:5432/railway`).
   - Clique sur le **service de ton app** (pas la base).
   - Onglet **Variables** → **Add Variable** (ou **+**).
   - Nom : **`DATABASE_URL`**.
   - Valeur : **copie la valeur** depuis le service PostgreSQL (bouton « Copy » à côté de `DATABASE_URL` dans le service Postgres, ou « Reference » si Railway propose de référencer la variable).
   - Sauvegarde.

Tu n’as **pas besoin de Volume** : la base est un service à part, les données restent entre les redéploiements.

## 4. Autres variables (ton app)

Dans le **service de ton app** (pas Postgres) → **Variables**, assure-toi d’avoir :

| Variable         | Valeur / remarque |
|------------------|--------------------|
| `DATABASE_URL`   | Copiée depuis le service PostgreSQL (voir ci-dessus). |
| `ADMIN_USER`     | `admin` (ou ce que tu veux). |
| `ADMIN_PASSWORD` | Un mot de passe fort. |

## 5. Commande de démarrage

Dans le service de ton app → **Settings** → **Deploy** / **Start Command** :

```bash
npm run start:railway
```

(Ce script lance `prisma migrate deploy` puis `next start`.)

## 6. URL publique

Dans le service de ton app → **Settings** → **Networking** → **Generate domain**.  
Ton site est accessible à l’URL affichée (vitrine + `/admin`).

## 7. Résumé

- **Base** : service **PostgreSQL** Railway (données persistantes, pas de volume à gérer).
- **App** : variable **`DATABASE_URL`** = celle du service Postgres.
- **Start** : `npm run start:railway`.
- À chaque redéploiement, la base reste intacte.

## Dépannage

- **« Relation does not exist »** : les migrations ne sont pas passées. Vérifie que `npm run start:railway` est bien la commande de démarrage et redéploie.
- **Connexion refusée à la base** : vérifie que `DATABASE_URL` du service app pointe bien vers le service PostgreSQL (copier depuis les variables du service Postgres).
