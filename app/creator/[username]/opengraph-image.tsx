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
  searchParams?: { product?: string };
};

function formatPriceMinorUnits(amountMinorUnits: number, currency: string) {
  if (currency === "USDC") {
    return `${(amountMinorUnits / 1_000_000).toFixed(2)} USDC`;
  }
  const sol = amountMinorUnits / 1_000_000_000;
  return `${sol.toFixed(sol < 1 ? 2 : 1)} SOL`;
}

export default async function OpengraphImage({ params, searchParams }: Props) {
  const username = params.username;
  try {
    const profile = await getCreatorProfile(username);
    const displayName = profile.displayName || profile.username;
    const productId = searchParams?.product;
    const product = productId
      ? profile.products.find((item) => item.id === productId)
      : undefined;
    const productLabel = product ? product.title : "Creator checkout";
    const priceLabel = product?.variants?.[0]?.amountMinorUnits
      ? formatPriceMinorUnits(product.variants[0].amountMinorUnits, product.currency)
      : product
        ? formatPriceMinorUnits(product.priceMinorUnits, product.currency)
        : "";
    const coverUrl = profile.coverUrl?.trim() || "";
    const showCover = coverUrl.startsWith("https://") || coverUrl.startsWith("/");

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
            position: "relative",
            overflow: "hidden",
          }}
        >
          {showCover ? (
            <img
              src={coverUrl}
              alt=""
              width={1200}
              height={630}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.52,
              }}
            />
          ) : null}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(0deg, rgba(6, 10, 20, 0.96) 10%, rgba(6, 10, 20, 0.55) 60%, rgba(6, 10, 20, 0.25) 100%)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 18,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 26,
                  fontWeight: 850,
                }}
              >
                N
              </div>
              <div style={{ fontSize: 22, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.9 }}>
                NodeBlink
              </div>
            </div>
            <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.03em" }}>
              {displayName}
            </div>
            <div style={{ fontSize: 28, lineHeight: 1.35, color: "rgba(255, 255, 255, 0.90)" }}>
              {productLabel}
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
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
              {priceLabel ? (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    fontSize: 18,
                  }}
                >
                  {priceLabel}
                </div>
              ) : null}
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: BRAND_COLORS.start,
                  color: "white",
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                Pay now
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
