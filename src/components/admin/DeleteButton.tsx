"use client";

import { useFormStatus } from "react-dom";

// Tombol hapus dengan konfirmasi. `action` adalah Server Action yang sudah di-bind id-nya.
export function DeleteButton({
  action,
  confirmText,
  label = "Hapus",
}: {
  action: (formData: FormData) => Promise<void>;
  confirmText: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <Btn label={label} />
    </form>
  );
}

function Btn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
    >
      {pending ? "Menghapus..." : label}
    </button>
  );
}
