import { NextResponse } from "next/server";
import {
  createSessionCookieValue,
  ADMIN_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = process.env.ADMIN_USER || "admin";
  const pass = process.env.ADMIN_PASSWORD || "";

  if (!pass) {
    return NextResponse.json(
      { ok: false, error: "Admin non configuré" },
      { status: 503 }
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Corps de requête invalide" },
      { status: 400 }
    );
  }

  const username = (body.username ?? "").trim();
  const password = body.password ?? "";

  if (username !== user || password !== pass) {
    return NextResponse.json(
      { ok: false, error: "Identifiant ou mot de passe incorrect" },
      { status: 401 }
    );
  }

  const value = createSessionCookieValue();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}
