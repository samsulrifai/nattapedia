// Tag cache konten publik. Admin memanggil `updateTag(TAGS.x)` / `revalidateTag`
// setelah menyimpan perubahan agar halaman publik langsung diperbarui.
export const TAGS = {
  settings: "site-settings",
  services: "services",
  portfolio: "portfolio",
  testimonials: "testimonials",
} as const;
