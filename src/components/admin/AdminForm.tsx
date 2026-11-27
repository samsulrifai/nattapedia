"use client";

import { createContext, useActionState, useContext, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { initialFormState, type FormState } from "@/lib/admin/form-state";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

const FormStateContext = createContext<FormState>(initialFormState);
export const useAdminFormState = () => useContext(FormStateContext);

// Form admin generik: menjalankan Server Action, menampilkan pesan sukses/error,
// dan mengembalikan isian saat validasi gagal (lewat state.values).
export function AdminForm({
  action,
  children,
  submitLabel = "Simpan",
  className,
}: {
  action: Action;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, initialFormState);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status !== "idle") messageRef.current?.focus();
  }, [state]);

  return (
    <FormStateContext.Provider value={state}>
      <form action={formAction} className={className ?? "max-w-3xl space-y-5"} noValidate>
        <div ref={messageRef} tabIndex={-1} aria-live="polite" className="outline-none">
          {state.status === "error" && state.message && (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {state.message}
            </p>
          )}
          {state.status === "success" && state.message && (
            <p className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              {state.message}
            </p>
          )}
        </div>
        {children}
        <SubmitButton label={submitLabel} />
      </form>
    </FormStateContext.Provider>
  );
}

export function SubmitButton({ label, pendingLabel = "Menyimpan..." }: { label: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
