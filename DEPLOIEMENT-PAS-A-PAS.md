# Déploiement pas à pas (depuis zéro)

Tu n’as rien poussé sur GitHub : ce guide te mène du premier commit jusqu’au site en ligne sur Railway.

---

## Partie 1 : GitHub

### Étape 1.1 – Compte GitHub
- Si tu n’as pas de compte : [github.com](https://github.com) → **Sign up**.
- Connecte-toi.

### Étape 1.2 – Créer un nouveau dépôt
1. Clique sur **"+"** en haut à droite → **New repository**.
2. **Repository name** : `cobblemon-market` (ou un autre nom si tu préfères).
3. Laisse **Public**.
4. **Ne coche pas** "Add a README" (le projet en a déjà un).
5. Clique sur **Create repository**.

Tu arrives sur une page avec une URL du type :  
`https://github.com/TON_USERNAME/cobblemon-market.git`  
Garde cette URL sous la main (remplace `TON_USERNAME` par ton pseudo GitHub).

---

## Partie 2 : Git sur ton PC

Ouvre un terminal **dans le dossier du projet** (`c:\TropiShop\cobblemon-market`).

### Étape 2.1 – Vérifier que Git est installé
```bash
git --version
```
Si tu as une version (ex. `git version 2.43...`), c’est bon. Sinon installe Git : [git-scm.com](https://git-scm.com).

### Étape 2.2 – Initialiser le dépôt
```bash
git init
```

### Étape 2.3 – Tout ajouter (le .gitignore exclut déjà .env et node_modules)
```bash
git add .
```

### Étape 2.4 – Premier commit
```bash
git commit -m "Initial commit - Cobblemon Market"
```

### Étape 2.5 – Branche principale
Au cas où Git utilise encore "master" :
```bash
git branch -M main
```

### Étape 2.6 – Lier à GitHub et pousser
Remplace `TON_USERNAME` et `cobblemon-market` si tu as choisi un autre nom de repo :
```bash
git remote add origin https://github.com/TON_USERNAME/cobblemon-market.git
git push -u origin main
```
- Si on te demande de te connecter : utilise ton compte GitHub (ou un **Personal Access Token** si tu as la 2FA).
- Après le `git push`, ton code est sur GitHub.

---

## Partie 3 : Railway

### Étape 3.1 – Créer un compte Railway
- Va sur [railway.app](https://railway.app).
- **Login** → **Sign in with GitHub** (le plus simple).

### Étape 3.2 – Nouveau projet depuis GitHub
1. **New Project**.
2. Choisis **Deploy from GitHub repo**.
3. Si on te demande d’autoriser Railway : **Configure GitHub App** et autorise l’accès au repo `cobblemon-market` (ou "All repositories" si tu préfères).
4. Sélectionne le repo **cobblemon-market**.
5. Railway crée un service et lance un premier build (il peut échouer tant qu’on n’a pas mis le volume et les variables — c’est normal).

### Étape 3.3 – Ajouter un volume (pour la base SQLite)
1. Clique sur ton **service** (la carte du projet).
2. Onglet **Settings** (ou **Variables** puis cherche **Volumes** dans le menu).
3. Section **Volumes** → **Add Volume** (ou **+ New Volume**).
4. **Mount Path** : saisis **`/app/data`**.
5. Enregistre / **Add**.

### Étape 3.4 – Variables d’environnement
1. Dans le même service, va dans **Variables** (onglet en haut).
2. **Add Variable** (ou **+ New Variable**) et ajoute une par une :

| Nom              | Valeur                          |
|------------------|----------------------------------|
| `DATABASE_URL`   | `file:/app/data/prisma.db`      |
| `ADMIN_USER`     | `admin`                         |
| `ADMIN_PASSWORD` | (choisis un mot de passe fort)  |

3. Sauvegarde. Railway redéploie souvent tout seul après un changement de variables.

### Étape 3.5 – Commande de démarrage
1. Toujours dans le service → **Settings**.
2. Descends jusqu’à **Deploy** / **Build** (ou **Custom Start Command**).
3. Champ **Start Command** (ou **Custom start command**) :  
   **`npm run start:railway`**
4. Enregistre.

### Étape 3.6 – Domaine public
1. Dans le service → **Settings** → **Networking** (ou **Public Networking**).
2. **Generate domain** (ou **Add domain**).
3. Tu obtiens une URL du type :  
   **`cobblemon-market-production-xxxx.up.railway.app`**

### Étape 3.7 – Redéploiement (pour être sûr)
1. Onglet **Deployments**.
2. Clique sur les **...** du dernier déploiement → **Redeploy** (ou **Deploy** pour relancer).
3. Attends que le statut soit **Success** / **Active**.

---

## C’est en ligne

- **Vitrine** : `https://ton-url.up.railway.app/`
- **Admin (upload JSON)** : `https://ton-url.up.railway.app/admin`  
  → identifiants : `ADMIN_USER` / `ADMIN_PASSWORD` que tu as mis en variables.

La première fois que tu iras sur `/admin`, la base sera vide ; tu pourras uploader ton JSON d’export Cobblemon comme en local.

---

## Récap des commandes (Partie 2)

À exécuter dans `c:\TropiShop\cobblemon-market` :

```bash
git init
git add .
git commit -m "Initial commit - Cobblemon Market"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/cobblemon-market.git
git push -u origin main
```

Ensuite : Railway → New Project → GitHub repo → Volume `/app/data` → Variables → Start command `npm run start:railway` → Generate domain.
