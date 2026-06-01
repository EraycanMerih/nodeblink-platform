import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { PUBLIC_BASE_URL } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "NodeBlink | Creator checkout on Solana",
    template: "%s | NodeBlink",
  },
  description:
    "Sell tips, gated files, access passes, and collectibles on Solana with native Actions discovery at nodeblink.dev.",
  metadataBase: new URL(PUBLIC_BASE_URL),
  openGraph: {
    title: "NodeBlink",
    description:
      "Non-custodial creator checkout with actions.json discovery and mobile wallet deep links.",
    url: PUBLIC_BASE_URL,
    siteName: "NodeBlink",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
