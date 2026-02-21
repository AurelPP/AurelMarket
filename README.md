# Cobblemon Market (JSON -> Vitrine)

Petit site vitrine Next.js + Prisma + SQLite.

## Prérequis
- Node.js 18+ (recommandé 20+)

## Installation
```bash
npm install
cp .env.example .env
# édite .env et change ADMIN_PASSWORD
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

## URLs
- Vitrine: http://localhost:3000/
- Admin upload: http://localhost:3000/admin (Basic Auth via .env)

## Import
Dans /admin, uploade un fichier JSON exporté par Cobblemon Export (un tableau d'objets Pokémon).

## Notes
- Déduplication: si `uuid` est présent, on upsert dessus. Sinon, on utilise un `fingerprint`.
- Le filtre "IV total" est fait côté serveur après requête (SQLite + Prisma).
