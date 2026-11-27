import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

// Endpoint Better Auth: /api/auth/sign-in/email, /api/auth/sign-out, /api/auth/get-session, dst.
// Endpoint sign-up ada tetapi menolak permintaan (disableSignUp).
function notConfigured() {
  return Response.json({ error: "Auth belum dikonfigurasi" }, { status: 503 });
}

export async function GET(request: Request) {
  const auth = getAuth();
  return auth ? toNextJsHandler(auth).GET(request) : notConfigured();
}

export async function POST(request: Request) {
  const auth = getAuth();
  return auth ? toNextJsHandler(auth).POST(request) : notConfigured();
}
