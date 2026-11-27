"use client";

import { createAuthClient } from "better-auth/react";

// Klien auth untuk komponen client (form login, tombol logout).
// Contoh: await authClient.signIn.email({ email, password });
//         await authClient.signOut();
export const authClient = createAuthClient();
