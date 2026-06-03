import { ImageResponse } from "next/og";
import { BRAND_COLORS } from "@/lib/brand";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const size = {
  width: 1200,
  height: 630,
};

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
          padding: 72,
          background:
            "radial-gradient(circle at 20% 10%, rgba(99, 91, 255, 0.45) 0%, rgba(10, 37, 64, 0) 55%), radial-gradient(circle at 80% 90%, rgba(154, 123, 255, 0.35) 0%, rgba(10, 37, 64, 0) 55%), linear-gradient(135deg, #081a2f 0%, #070e1a 60%, #070816 100%)",
          color: "white",
          fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 22, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.86 }}>
            NodeBlink
          </div>
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.05 }}>
            A checkout link for creators
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.4, color: "rgba(255, 255, 255, 0.86)" }}>
            Sell tips, files, access passes, and collectibles on Solana.
          </div>
          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.16)",
                fontSize: 18,
              }}
            >
              Wallet-native
            </div>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.16)",
                fontSize: 18,
              }}
            >
              Non-custodial
            </div>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                background: BRAND_COLORS.start,
                color: "white",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              Share one link
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "Cache-Control": "public, max-age=86400, immutable",
      },
    },
  );
}
