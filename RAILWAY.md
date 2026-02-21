# Déployer Cobblemon Market sur Railway

Guide pas à pas pour mettre l’app en ligne 24/7 sur [Railway](https://railway.app).

## 1. Préparer le dépôt

- Pousse le projet sur **GitHub** (ou GitLab) si ce n’est pas déjà fait.
- Vérifie que ton `.env` n’est **pas** commité (il doit être dans `.gitignore`).

## 2. Créer un projet Railway

1. Va sur [railway.app](https://railway.app) et connecte-toi (GitHub recommandé).
2. **New Project** → **Deploy from GitHub repo**.
3. Choisis le repo `cobblemon-market` (autorise Railway si besoin).
4. Railway crée un service et lance un premier build.

## 3. Base de données (SQLite + volume)

Sur Railway, le disque est éphémère sauf si tu montes un **Volume**. Il faut stocker le fichier SQLite sur ce volume.

1. Dans ton projet Railway, ouvre le **service** (ton app).
2. Onglet **Variables** : on va ajouter les variables après.
3. Onglet **Settings** (ou **Volumes** selon l’interface) :
   - **Add Volume** (ou **Mount Volume**).
   - **Mount path** : `/app/data` (Railway exécute l’app depuis `/app` ; le volume doit être dans ce chemin).
   - Enregistre.

## 4. Variables d’environnement

Dans le service → **Variables** (ou **Environment**), ajoute :

| Variable         | Valeur (exemple)     | Obligatoire |
|------------------|----------------------|-------------|
| `DATABASE_URL`   | `file:/app/data/prisma.db` | Oui    |
| `ADMIN_USER`     | `admin`              | Recommandé  |
| `ADMIN_PASSWORD` | un mot de passe fort | Oui        |

- **DATABASE_URL** : doit pointer vers un chemin **dans** le volume, ici `/app/data/prisma.db`.
- **ADMIN_USER** / **ADMIN_PASSWORD** : identifiants pour la zone `/admin` (Basic Auth).

Tu peux tout mettre en **Plaintext** ; pour plus de sécurité, utilise les **Variables** sensibles de Railway si proposé.

## 5. Commande de démarrage

Railway utilise par défaut `npm run start`. Il faut d’abord appliquer les migrations Prisma à chaque déploiement.

1. Dans le service → **Settings**.
2. **Deploy** (ou **Build & Deploy**) :
   - **Custom start command** (ou **Start Command**) :  
     `npm run start:railway`  
     (ce script fait `prisma migrate deploy` puis `next start`).

Si l’option s’appelle **Start Command**, mets exactement :

```bash
npm run start:railway
```

Enregistre.

## 6. Redéploiement

- Déclenche un **Redeploy** (bouton dans l’onglet **Deployments** ou **Settings**).
- Au premier déploiement avec le volume et `DATABASE_URL`, Prisma crée le fichier `/app/data/prisma.db` et applique les migrations.

## 7. URL publique

1. Dans le service → **Settings** → **Networking** (ou **Public Networking**).
2. **Generate domain** (ou **Add domain**) pour obtenir une URL du type `xxx.up.railway.app`.
3. Ton site est accessible à cette URL (vitrine + `/admin` pour l’upload).

## 8. Résumé des réglages

- **Build** : `npm run build` (déjà configuré dans `package.json` avec `prisma generate`).
- **Start** : `npm run start:railway` (migrations + `next start`).
- **Volume** : monté en `/app/data`, `DATABASE_URL=file:/app/data/prisma.db`.
- **Variables** : `DATABASE_URL`, `ADMIN_USER`, `ADMIN_PASSWORD`.

## Dépannage

- **Build échoue** : vérifie que `prisma generate` est bien dans le script `build` et que les migrations sont commitées dans `prisma/migrations/`.
- **Erreur au démarrage (DB)** : vérifie que le volume est bien monté en `/app/data` et que `DATABASE_URL` est `file:/app/data/prisma.db`.
- **Admin ne marche pas** : vérifie que `ADMIN_PASSWORD` est défini (et `ADMIN_USER` si tu l’utilises).

Une fois tout ça en place, chaque push sur la branche connectée déclenchera un nouveau déploiement (si l’auto-deploy est activé).
