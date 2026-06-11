import { ImageResponse } from "next/og";
import { getCreatorProfile } from "@/lib/creator-actions";
import { getRequestOrigin } from "@/lib/request-origin";
import { BRAND_COLORS } from "@/lib/brand";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type Props = {
  params: { username: string; productId: string };
};

function formatPrice(amountMinorUnits: number, currency: string): string {
  if (currency === "USD") return `$${(amountMinorUnits / 100).toFixed(2)}`;
  if (currency === "USDC")
    return `${(amountMinorUnits / 1_000_000).toFixed(2)} USDC`;
  const sol = amountMinorUnits / 1_000_000_000;
  return `${sol.toFixed(sol < 1 ? 2 : 1)} SOL`;
}

export default async function OpengraphImage({ params }: Props) {
  const { username, productId } = params;

  try {
    const profile = await getCreatorProfile(username);
    const product = profile.products.find((p) => p.id === productId);
    const displayName = profile.displayName || profile.username;
    const productTitle = product?.title ?? "Creator Checkout";
    const priceLabel = product
      ? formatPrice(product.priceMinorUnits, product.currency)
      : "";

    let origin = "";
    try {
      origin = await getRequestOrigin();
    } catch {
      origin = "https://nodeblink.dev";
    }

    const hasImage = product?.imageUrl && product.imageUrl.length > 0;
    const imageUrl = hasImage
      ? product.imageUrl!.startsWith("http")
        ? product.imageUrl!
        : `${origin}${product.imageUrl}`
      : null;

    const avatarUrl = profile.avatarUrl
      ? profile.avatarUrl.startsWith("http")
        ? profile.avatarUrl
        : `${origin}${profile.avatarUrl}`
      : null;

    // If product has an uploaded image, render a gorgeous card with the image as background
    if (imageUrl) {
      return new ImageResponse(
        (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              position: "relative",
              overflow: "hidden",
              fontFamily:
                "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
            }}
          >
            {/* Product image as background */}
            <img
              src={imageUrl}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Dark gradient overlay for readability */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.88) 100%)",
              }}
            />
            {/* Content */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: 64,
                color: "#fff",
              }}
            >
              {/* Product Title */}
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: "-0.03em",
                  marginBottom: 12,
                  textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                }}
              >
                {productTitle}
              </div>
              {/* Creator + Price row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginTop: 4,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontSize: 18,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {avatarUrl && (
                    <img
                      src={avatarUrl}
                      width={24}
                      height={24}
                      style={{ borderRadius: 12, objectFit: "cover" }}
                    />
                  )}
                  <span>by @{profile.username}</span>
                </div>
                {priceLabel && (
                  <div
                    style={{
                      padding: "8px 16px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.15)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    {priceLabel}
                  </div>
                )}
                <div
                  style={{
                    padding: "8px 20px",
                    borderRadius: 999,
                    background: BRAND_COLORS.start,
                    color: "#062a24",
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  Buy now
                </div>
              </div>
              {/* NodeBlink branding watermark */}
              <div
                style={{
                  position: "absolute",
                  top: 36,
                  right: 48,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  opacity: 0.9,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 900,
                    color: "#fff",
                  }}
                >
                  N
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase" as const,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  NodeBlink
                </div>
              </div>
            </div>
          </div>
        ),
        {
          ...size,
          headers: { "Cache-Control": "public, max-age=3600" },
        }
      );
    }

    // Fallback: no product image — render branded gradient card
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
              "radial-gradient(circle at 18% 20%, rgba(85, 214, 190, 0.62) 0%, rgba(6, 42, 36, 0) 58%), radial-gradient(circle at 84% 78%, rgba(172, 252, 217, 0.44) 0%, rgba(6, 42, 36, 0) 60%), linear-gradient(135deg, #061a17 0%, #050d0c 70%, #050807 100%)",
            color: "rgba(243, 246, 255, 0.98)",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(0deg, rgba(6, 10, 20, 0.96) 10%, rgba(6, 10, 20, 0.55) 60%, rgba(6, 10, 20, 0.25) 100%)",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              position: "relative",
            }}
          >
            {/* NodeBlink branding */}
            <div
              style={{ display: "flex", alignItems: "center", gap: 14 }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  fontWeight: 850,
                }}
              >
                N
              </div>
              <div
                style={{
                  fontSize: 20,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  opacity: 0.9,
                }}
              >
                NodeBlink
              </div>
            </div>
            {/* Product Title */}
            <div
              style={{
                fontSize: 58,
                fontWeight: 900,
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
              }}
            >
              {productTitle}
            </div>
            {/* Creator name */}
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.35,
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              by {displayName}
            </div>
            {/* Badges */}
            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  fontSize: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    width={24}
                    height={24}
                    style={{ borderRadius: 12, objectFit: "cover" }}
                  />
                )}
                <span>@{profile.username}</span>
              </div>
              {priceLabel && (
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  {priceLabel}
                </div>
              )}
              <div
                style={{
                  padding: "10px 20px",
                  borderRadius: 999,
                  background: BRAND_COLORS.start,
                  color: "#062a24",
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                Buy now
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        headers: { "Cache-Control": "public, max-age=86400, immutable" },
      }
    );
  } catch {
    // Ultimate fallback
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
              "radial-gradient(circle at 18% 20%, rgba(85, 214, 190, 0.55) 0%, rgba(6, 42, 36, 0) 55%), linear-gradient(135deg, #061a17 0%, #050d0c 70%, #050807 100%)",
            color: "rgba(243, 246, 255, 0.98)",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            <div
              style={{
                fontSize: 22,
                letterSpacing: "0.22em",
                textTransform: "uppercase" as const,
                opacity: 0.86,
              }}
            >
              NodeBlink
            </div>
            <div
              style={{ fontSize: 58, fontWeight: 850, lineHeight: 1.05 }}
            >
              Creator checkout
            </div>
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.4,
                color: "rgba(255, 255, 255, 0.86)",
              }}
            >
              Pay with crypto or card
            </div>
          </div>
        </div>
      ),
      {
        ...size,
        headers: { "Cache-Control": "public, max-age=86400, immutable" },
      }
    );
  }
}
