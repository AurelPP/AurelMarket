import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const loginUrl = new URL("/admin/login", url.origin);
  const res = NextResponse.redirect(loginUrl);
  res.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return res;
}
