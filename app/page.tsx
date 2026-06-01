import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LandingPage } from "@/components/landing-page";
import { getPublicProtocolStats } from "@/lib/public-stats";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const stats = await getPublicProtocolStats();

  return (
    <>
      <SiteHeader />
      <LandingPage stats={stats} />
      <SiteFooter />
    </>
  );
}
