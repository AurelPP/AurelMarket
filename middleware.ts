import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "admin_session";
const SESSION_HOURS = 24;

function unauthorized() {
  return new NextResponse("Authentification requise", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
  });
}

async function checkSessionCookie(cookieValue: string): Promise<boolean> {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) return false;
  try {
    const payload = JSON.parse(atob(cookieValue)) as { t: number; h: string };
    if (Date.now() - payload.t > SESSION_HOURS * 60 * 60 * 1000) return false;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(pass),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign(
      "HMAC",
      key,
      enc.encode(payload.t.toString())
    );
    const hex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hex === payload.h;
  } catch {
    return false;
  }
}

async function createSessionCookie(): Promise<string> {
  const pass = process.env.ADMIN_PASSWORD;
  const t = Date.now();
  if (!pass) return btoa(JSON.stringify({ t, h: "" }));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(pass),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(t.toString()));
  const h = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return btoa(JSON.stringify({ t, h }));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  const user = process.env.ADMIN_USER || "admin";
  const pass = process.env.ADMIN_PASSWORD || "";
  if (!pass) return unauthorized();

  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (cookie && (await checkSessionCookie(cookie))) {
    return NextResponse.next();
  }

  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return unauthorized();

  const b64 = auth.slice("Basic ".length).trim();
  let decoded: string;
  try {
    decoded = atob(b64);
  } catch {
    return unauthorized();
  }
  const colon = decoded.indexOf(":");
  const u = colon >= 0 ? decoded.slice(0, colon) : decoded;
  const p = colon >= 0 ? decoded.slice(colon + 1) : "";

  if (u !== user || p !== pass) return unauthorized();

  const res = NextResponse.next();
  const value = await createSessionCookie();
  res.cookies.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_HOURS * 60 * 60,
    path: "/",
  });
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
