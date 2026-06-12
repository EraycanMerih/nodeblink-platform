import { ImageResponse } from "next/og";
import { getCreatorProfileByDomain } from "@/lib/creator-actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ domain: string }> }) {
  const { domain } = await context.params;
  try {
    const profile = await getCreatorProfileByDomain(domain);
    if (!profile) throw new Error("not found");
    const displayName = profile.displayName || profile.username;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background:
              "radial-gradient(circle at 30% 20%, rgba(99, 91, 255, 0.55) 0%, rgba(7, 10, 20, 0) 55%), radial-gradient(circle at 70% 80%, rgba(154, 123, 255, 0.45) 0%, rgba(7, 10, 20, 0) 58%), linear-gradient(135deg, #081a2f 0%, #070816 100%)",
            color: "white",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 850,
              letterSpacing: "-0.03em",
              textAlign: "center",
              padding: "0 40px",
            }}
          >
            {displayName}
          </div>
          <div style={{ marginTop: 16, fontSize: 24, opacity: 0.86 }}>NodeBlink</div>
        </div>
      ),
      {
        width: 512,
        height: 512,
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
            alignItems: "center",
            background:
              "radial-gradient(circle at 30% 20%, rgba(99, 91, 255, 0.55) 0%, rgba(7, 10, 20, 0) 55%), radial-gradient(circle at 70% 80%, rgba(154, 123, 255, 0.45) 0%, rgba(7, 10, 20, 0) 58%), linear-gradient(135deg, #081a2f 0%, #070816 100%)",
            color: "white",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 850, letterSpacing: "-0.03em" }}>NodeBlink</div>
        </div>
      ),
      {
        width: 512,
        height: 512,
        headers: {
          "Cache-Control": "public, max-age=86400, immutable",
        },
      },
    );
  }
}
