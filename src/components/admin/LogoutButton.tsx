"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        router.replace("/admin/login");
        router.refresh();
      }}
      className="text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-60"
    >
      {pending ? "Keluar..." : "Keluar"}
    </button>
  );
}
