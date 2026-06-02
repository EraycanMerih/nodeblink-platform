import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { CreatorCheckoutShell } from "@/components/creator-checkout-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCreatorProfile } from "@/lib/creator-actions";
import { getRequestOrigin } from "@/lib/request-origin";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ username: string }>;
};

const MOBILE_UA =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

export default async function CreatorPage({ params }: PageProps) {
  const { username } = await params;
  const profile = await getCreatorProfile(username);

  const headerList = await headers();
  const userAgent = headerList.get("user-agent") ?? "";
  const mobile = MOBILE_UA.test(userAgent);
  const origin = await getRequestOrigin();
  const actionApiUrl = `${origin}/api/v1/actions/creator/${encodeURIComponent(profile.username)}`;

  if (!profile.username) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <CreatorCheckoutShell creator={profile} actionApiUrl={actionApiUrl} mobile={mobile} />
      <SiteFooter />
    </>
  );
}
