import { ImageResponse } from "next/og";
import { getCreatorProfile } from "@/lib/creator-actions";
import { BRAND_COLORS } from "@/lib/brand";
import { getRequestOrigin } from "@/lib/request-origin";

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
    
    // Check if the parameter is a single value or an array, depending on how Next.js parses it here.
    const productParam = searchParams?.product;
    const productId = Array.isArray(productParam) ? productParam[0] : productParam;

    const product = productId
      ? profile.products.find((item) => item.id === productId)
      : profile.products[0]; // If no product specified, highlight their first product!

    const productLabel = product ? product.title : "Premium Checkout";
    const productDescription = product?.description ? product.description.slice(0, 80) + (product.description.length > 80 ? "..." : "") : "";
    const priceLabel = product?.variants?.[0]?.amountMinorUnits
      ? formatPriceMinorUnits(product.variants[0].amountMinorUnits, product.currency)
      : product
        ? formatPriceMinorUnits(product.priceMinorUnits, product.currency)
        : "";

    let origin = "";
    try {
      origin = await getRequestOrigin();
    } catch {
      origin = "https://nodeblink.dev";
    }

    const avatarUrl = profile.avatarUrl
      ? profile.avatarUrl.startsWith("http")
        ? profile.avatarUrl
        : `${origin}${profile.avatarUrl}`
      : null;

    const productImageUrl = product?.imageUrl
      ? product.imageUrl.startsWith("http")
        ? product.imageUrl
        : `${origin}${product.imageUrl}`
      : null;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#030712", // Very dark sleek slate
            color: "rgba(243, 246, 255, 0.98)",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Immersive Blurred Orbs */}
          <div
            style={{
              position: "absolute",
              top: -100,
              left: -100,
              width: 800,
              height: 800,
              background: "radial-gradient(circle, rgba(85,214,190,0.3) 0%, rgba(0,0,0,0) 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -200,
              right: -200,
              width: 1000,
              height: 1000,
              background: "radial-gradient(circle, rgba(154,123,255,0.2) 0%, rgba(0,0,0,0) 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(3,7,18,0) 0%, rgba(3,7,18,0.8) 100%)",
            }}
          />

          {/* Top Bar: Creator Info */}
          <div
            style={{
              position: "absolute",
              top: 40,
              left: 40,
              display: "flex",
              alignItems: "center",
              gap: 16,
              background: "rgba(255,255,255,0.06)",
              padding: "12px 24px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                width={40}
                height={40}
                style={{ borderRadius: 20, objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>
                {displayName}
              </span>
            </div>
            {profile.featured && (
              <div
                style={{
                  background: "var(--brand-start, #55d6be)",
                  color: "#000",
                  padding: "4px 8px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Verified
              </div>
            )}
          </div>

          <div
            style={{
              position: "absolute",
              top: 50,
              right: 40,
              fontSize: 24,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              opacity: 0.6,
              fontWeight: 800,
            }}
          >
            NodeBlink
          </div>

          {/* Central Product Glass Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: 900,
              height: 400,
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 32,
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
              overflow: "hidden",
            }}
          >
            {/* Left side: Image or Pattern */}
            <div
              style={{
                width: 400,
                height: "100%",
                background: "rgba(255,255,255,0.02)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {productImageUrl ? (
                <img
                  src={productImageUrl}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at center, rgba(85,214,190,0.2) 0%, rgba(0,0,0,0) 80%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 32,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 48,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    📦
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Details */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: 48,
                flex: 1,
              }}
            >
              <div
                style={{
                  color: "#9a7bff",
                  fontSize: 18,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 16,
                }}
              >
                {product ? product.archetype.replace(/_/g, " ") : "Storefront"}
              </div>
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  color: "#fff",
                  marginBottom: 20,
                }}
              >
                {productLabel}
              </div>
              {productDescription && (
                <div
                  style={{
                    fontSize: 22,
                    lineHeight: 1.4,
                    color: "rgba(255,255,255,0.6)",
                    marginBottom: 32,
                  }}
                >
                  {productDescription}
                </div>
              )}
              
              <div style={{ display: "flex", alignItems: "center", marginTop: "auto", gap: 24 }}>
                {priceLabel && (
                  <div
                    style={{
                      fontSize: 42,
                      fontWeight: 800,
                      color: "#55d6be",
                    }}
                  >
                    {priceLabel}
                  </div>
                )}
                
                <div
                  style={{
                    background: "#fff",
                    color: "#000",
                    padding: "16px 32px",
                    borderRadius: 16,
                    fontSize: 22,
                    fontWeight: 700,
                    marginLeft: "auto",
                  }}
                >
                  Buy Now
                </div>
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
    // Fallback Image
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#030712",
            color: "rgba(243, 246, 255, 0.98)",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, sans-serif",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em" }}>
            NodeBlink
          </div>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.5)", marginTop: 16 }}>
            Creator checkout
          </div>
        </div>
      ),
      { ...size }
    );
  }
}
