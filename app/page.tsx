import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LandingPage } from "@/components/landing-page";
import { getPublicProtocolStats } from "@/lib/public-stats";
import { getRequestOrigin } from "@/lib/request-origin";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const origin = await getRequestOrigin();
  const stats = await getPublicProtocolStats(origin);

  return (
    <>
      <SiteHeader />
      <LandingPage stats={stats} />
      <SiteFooter />
    </>
  );
}
