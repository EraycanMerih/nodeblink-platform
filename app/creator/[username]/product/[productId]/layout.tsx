import type { Metadata } from "next";
import { getCreatorProfile } from "@/lib/creator-actions";
import { getRequestOrigin } from "@/lib/request-origin";

type Props = {
  params: Promise<{ username: string; productId: string }>;
  children: React.ReactNode;
};

function resolvePreviewImage(origin: string, coverUrl: string | null | undefined) {
  const value = (coverUrl ?? "").trim();
  if (!value) return `${origin}/opengraph-image?v=4`;
  const lower = value.toLowerCase();
  if (!(lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif"))) {
    return `${origin}/opengraph-image?v=4`;
  }
  if (value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${origin}${value}`;
  return `${origin}/opengraph-image?v=4`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, productId } = await params;
  const profile = await getCreatorProfile(username);
  const origin = await getRequestOrigin();

  const product = profile.products.find((item) => item.id === productId);
  const title = product ? `${product.title} · ${profile.displayName}` : `${profile.displayName} · NodeBlink`;
  const description =
    product?.description ||
    profile.bio ||
    `Pay ${profile.displayName} on Solana with native wallet buttons.`;

  const pageUrl = `${origin}/creator/${profile.username}/product/${encodeURIComponent(productId)}`;
  const previewImage = resolvePreviewImage(origin, profile.coverUrl);
  const actionUrl = `${origin}/api/v1/actions/creator/${profile.username}?productId=${encodeURIComponent(productId)}`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "NodeBlink",
      type: "website",
      images: [{ url: previewImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [previewImage],
    },
    other: {
      "solana:action": actionUrl,
    },
  };
}

export default function CreatorProductLayout({ children }: Props) {
  return children;
}
