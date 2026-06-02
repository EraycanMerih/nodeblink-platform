import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { getRequestOrigin } from "@/lib/request-origin";
import { OG_IMAGE_16_9_URL } from "@/lib/brand";
import { ThemeScript } from "@/components/theme-script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export async function generateMetadata(): Promise<Metadata> {
  const origin = await getRequestOrigin();
  const title = "NodeBlink | Creator checkout on Solana";
  const description =
    "Sell tips, gated files, access passes, and collectibles on Solana with native Actions discovery.";
  const ogImage = OG_IMAGE_16_9_URL;

  return {
    title: {
      default: title,
      template: "%s | NodeBlink",
    },
    description,
    metadataBase: new URL(origin),
    alternates: { canonical: origin },
    openGraph: {
      title: "NodeBlink",
      description:
        "Non-custodial creator checkout with actions.json discovery and mobile wallet deep links.",
      url: origin,
      siteName: "NodeBlink",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "NodeBlink" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "NodeBlink",
      description,
      images: [ogImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
