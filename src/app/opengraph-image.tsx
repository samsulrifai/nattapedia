import { ImageResponse } from "next/og";

// Gambar Open Graph default (1200x630) sesuai dokumen copy PTF-23.
// Dipakai jika site_settings.og_image belum diisi.
export const alt = "Nattapedia: Jasa Pembuatan Website & Aplikasi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#2453e0",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 20,
              background: "#ffffff",
              color: "#2453e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 60,
              fontWeight: 800,
            }}
          >
            N
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>Nattapedia</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 44, color: "#dce7fe" }}>Jasa Pembuatan Website &amp; Aplikasi</div>
        <div style={{ marginTop: 32, width: 120, height: 8, borderRadius: 4, background: "#f59e0b" }} />
      </div>
    ),
    size,
  );
}
