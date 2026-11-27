"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

const inputClass =
  "mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900";

function loginErrorMessage(status: number | undefined): string {
  if (status === 429) return "Terlalu banyak percobaan login. Tunggu 1 menit lalu coba lagi.";
  if (status === 401 || status === 400) return "Email atau password salah.";
  return "Login gagal. Periksa koneksi lalu coba lagi.";
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const { error: authError } = await authClient.signIn.email({ email, password });
      if (authError) {
        setError(loginErrorMessage(authError.status));
        setPending(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError(loginErrorMessage(undefined));
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      {error && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
      >
        {pending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
