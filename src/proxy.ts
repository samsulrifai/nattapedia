import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Proxy (pengganti middleware di Next.js 16): pemeriksaan cepat berbasis cookie.
// Jika cookie sesi tidak ada, /admin/* dialihkan ke /admin/login.
// Ini BUKAN otorisasi: validasi sesi ke database dilakukan di layout dashboard
// dan di setiap Server Action lewat requireAdmin().
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin/login")) return NextResponse.next();
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
