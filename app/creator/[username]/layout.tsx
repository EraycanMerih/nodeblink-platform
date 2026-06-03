import type { Metadata } from "next";
import { getCreatorProfile } from "@/lib/creator-actions";
import { getRequestOrigin } from "@/lib/request-origin";

type Props = {
  params: Promise<{ username: string }>;
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
  const { username } = await params;
  const profile = await getCreatorProfile(username);
  const origin = await getRequestOrigin();
  const title = `${profile.displayName} · NodeBlink Checkout`;
  const description =
    profile.bio ||
    `Pay ${profile.displayName} on Solana with native wallet buttons: tips, unlocks, and digital products.`;
  const pageUrl = `${origin}/creator/${profile.username}`;
  const previewImage = resolvePreviewImage(origin, profile.coverUrl);

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
      images: [{ url: previewImage, width: 1200, height: 630, alt: profile.displayName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [previewImage],
    },
    other: {
      "solana:action": `${origin}/api/v1/actions/creator/${profile.username}`,
    },
  };
}

export default function CreatorLayout({ children }: Props) {
  return children;
}
