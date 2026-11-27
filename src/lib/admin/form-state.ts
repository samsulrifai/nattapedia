// Bentuk state yang dikembalikan Server Action admin ke form (useActionState).
// Tidak mengimpor modul server, sehingga aman dipakai di komponen client.

export type FormValues = Record<string, string>;

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  // Nilai yang dikirim, dikembalikan saat error agar isian tidak hilang.
  values?: FormValues;
};

export const initialFormState: FormState = { status: "idle" };
