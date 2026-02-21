export function isAdminAuth(req: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return true; // pas de mot de passe configuré = tout autoriser (dev)
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === expected;
}
