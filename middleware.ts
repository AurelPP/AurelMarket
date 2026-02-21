import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "admin_session";
const SESSION_HOURS = 24;

function loginRedirect(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

function unauthorized() {
  return NextResponse.json(
    { error: "Authentification requise" },
    { status: 401 }
  );
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // Page de login et API de login : accès sans cookie
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/api/admin/login" && req.method === "POST")
    return NextResponse.next();

  const pass = process.env.ADMIN_PASSWORD || "";
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  const hasValidSession = cookie && pass && (await checkSessionCookie(cookie));

  if (hasValidSession) return NextResponse.next();

  // Pas de session : pour les pages admin → redirection login (toujours une page, jamais du JSON)
  if (pathname.startsWith("/admin")) return loginRedirect(req);
  return unauthorized();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
