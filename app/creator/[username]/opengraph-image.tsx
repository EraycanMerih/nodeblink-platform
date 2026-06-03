import { ImageResponse } from "next/og";
import { getCreatorProfile } from "@/lib/creator-actions";
import { BRAND_COLORS } from "@/lib/brand";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type Props = {
  params: { username: string };
};

export default async function OpengraphImage({ params }: Props) {
  const username = params.username;
  try {
    const profile = await getCreatorProfile(username);
    const displayName = profile.displayName || profile.username;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: 72,
            background:
              "radial-gradient(circle at 15% 20%, rgba(99, 91, 255, 0.55) 0%, rgba(10, 37, 64, 0) 58%), radial-gradient(circle at 85% 80%, rgba(154, 123, 255, 0.45) 0%, rgba(10, 37, 64, 0) 60%), linear-gradient(135deg, #071326 0%, #060a14 70%, #070816 100%)",
            color: "white",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 22, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.86 }}>
              NodeBlink
            </div>
            <div style={{ fontSize: 60, fontWeight: 850, lineHeight: 1.05 }}>{displayName}</div>
            <div style={{ fontSize: 26, lineHeight: 1.35, color: "rgba(255, 255, 255, 0.86)" }}>
              Pay directly on Solana
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  fontSize: 18,
                }}
              >
                @{profile.username}
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
                Pay or unlock
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
  } catch {
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
            <div style={{ fontSize: 58, fontWeight: 850, lineHeight: 1.05 }}>Creator checkout</div>
            <div style={{ fontSize: 26, lineHeight: 1.4, color: "rgba(255, 255, 255, 0.86)" }}>
              Pay directly on Solana
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
}
