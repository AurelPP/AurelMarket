import crypto from "crypto";

const SESSION_HOURS = 24;

/**
 * Crée la valeur du cookie de session admin (même format que le middleware Edge).
 * À utiliser côté API (Node) pour définir le cookie après login réussi.
 */
export function createSessionCookieValue(): string {
  const pass = process.env.ADMIN_PASSWORD;
  const t = Date.now();
  if (!pass) return Buffer.from(JSON.stringify({ t, h: "" })).toString("base64");
  const h = crypto.createHmac("sha256", pass).update(t.toString()).digest("hex");
  return Buffer.from(JSON.stringify({ t, h })).toString("base64");
}

export const ADMIN_COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE = SESSION_HOURS * 60 * 60;
