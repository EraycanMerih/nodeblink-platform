import type { Metadata } from "next";
import { getCreatorProfile } from "@/lib/creator-actions";
import { getRequestOrigin } from "@/lib/request-origin";
import { OG_IMAGE_16_9_URL } from "@/lib/brand";

type Props = {
  params: Promise<{ username: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getCreatorProfile(username);
  const origin = await getRequestOrigin();
  const title = `${profile.displayName} · NodeBlink Checkout`;
  const description =
    profile.bio ||
    `Pay ${profile.displayName} on Solana with native wallet buttons — tips, unlocks, and digital products.`;
  const pageUrl = `${origin}/creator/${profile.username}`;
  const icon = profile.avatarUrl.startsWith("http")
    ? profile.avatarUrl
    : `${origin}${profile.avatarUrl}`;
  const previewImage = icon.toLowerCase().endsWith(".svg") ? OG_IMAGE_16_9_URL : icon;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "NodeBlink",
      type: "website",
      images: [
        previewImage === OG_IMAGE_16_9_URL
          ? { url: previewImage, width: 1200, height: 630, alt: profile.displayName }
          : { url: previewImage, width: 512, height: 512, alt: profile.displayName },
      ],
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
