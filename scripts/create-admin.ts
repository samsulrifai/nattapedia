// Membuat (atau mereset password) akun admin. Dijalankan manual oleh DevOps/Fai:
//   npm run admin:create
// Script menanyakan email, nama, dan password secara interaktif (password tidak
// ditampilkan). Bisa juga lewat env ADMIN_EMAIL / ADMIN_NAME / ADMIN_PASSWORD
// untuk sesi sekali pakai. Password TIDAK pernah disimpan di repo atau di tugas.
import { createInterface } from "node:readline";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { account, user } from "../src/lib/db/schema";

function ask(question: string, hidden = false): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    const r = rl as unknown as { _writeToOutput: (s: string) => void; output: NodeJS.WriteStream };
    r._writeToOutput = (s: string) => {
      if (s.includes(question)) r.output.write(s);
    };
  }
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    }),
  );
}

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL belum diisi (.env.local)");

  const email = (process.env.ADMIN_EMAIL || (await ask("Email admin: "))).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email tidak valid");
  const name = process.env.ADMIN_NAME || (await ask("Nama tampilan: ")) || "Admin";
  const password = process.env.ADMIN_PASSWORD || (await ask("Password (min. 12 karakter): ", true));
  if (password.length < 12) throw new Error("Password minimal 12 karakter");
  if (!process.env.ADMIN_PASSWORD) {
    const again = await ask("Ulangi password: ", true);
    if (again !== password) throw new Error("Password tidak sama");
  }

  const db = drizzle(neon(url));
  const hash = await hashPassword(password);
  const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, email));

  if (existing[0]) {
    const userId = existing[0].id;
    const updated = await db
      .update(account)
      .set({ password: hash })
      .where(and(eq(account.userId, userId), eq(account.providerId, "credential")))
      .returning({ id: account.id });
    if (!updated[0]) {
      await db.insert(account).values({
        id: randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: hash,
      });
    }
    console.log(`Password admin ${email} diperbarui.`);
    return;
  }

  const userId = randomUUID();
  await db.insert(user).values({ id: userId, name, email, emailVerified: true });
  await db.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: hash,
  });
  console.log(`Akun admin ${email} dibuat.`);
}

main().catch((err) => {
  console.error(`Gagal: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
