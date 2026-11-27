// Tipe baris database, diturunkan otomatis dari skema Drizzle (src/lib/db/schema.ts).
// Jangan diedit manual: ubah skemanya, lalu tipe ini ikut berubah.
import type {
  leads,
  leadStatus,
  portfolio_images,
  portfolio_projects,
  services,
  site_settings,
  testimonials,
} from "@/lib/db/schema";

export type LeadStatus = (typeof leadStatus.enumValues)[number];

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type PortfolioProject = typeof portfolio_projects.$inferSelect;
export type NewPortfolioProject = typeof portfolio_projects.$inferInsert;
export type PortfolioImage = typeof portfolio_images.$inferSelect;
export type NewPortfolioImage = typeof portfolio_images.$inferInsert;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
export type SiteSettings = typeof site_settings.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
