"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { schema } from "@/lib/db";
import { leadStatus } from "@/lib/db/schema";
import type { FormState } from "@/lib/admin/form-state";
import { failState, FormReader, isUuid } from "@/lib/admin/validate";
import { getAdminDb, logAdminError } from "@/lib/admin/server";

// Leads tidak tampil di halaman publik, jadi tidak perlu updateTag.
export async function updateLead(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  if (!isUuid(id)) return failState("Data tidak ditemukan.");
  const f = new FormReader(fd);
  const status = f.oneOf("status", "Status", leadStatus.enumValues);
  const admin_notes = f.optionalText("admin_notes", "Catatan", 5000);
  if (f.hasErrors()) return f.fail();
  try {
    const rows = await getAdminDb()
      .update(schema.leads)
      .set({ status, admin_notes })
      .where(eq(schema.leads.id, id))
      .returning({ id: schema.leads.id });
    if (rows.length === 0) return failState("Lead tidak ditemukan.");
  } catch (error) {
    logAdminError("updateLead", error);
    return failState("Gagal menyimpan. Coba lagi beberapa saat.", f.values);
  }
  refresh();
  return { status: "success", message: "Status dan catatan disimpan." };
}
