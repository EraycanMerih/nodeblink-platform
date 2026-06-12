import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { UniversalPayShell } from '@/components/universal-pay-shell';
import { getCreatorProfileByDomain } from '@/lib/creator-actions';
import { getRequestOrigin } from '@/lib/request-origin';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

interface Props {
  params: Promise<{ domain: string }>;
  searchParams: Promise<{ product?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params;
  const origin = await getRequestOrigin();
  const creator = await getCreatorProfileByDomain(domain);
  if (!creator) return {};

  const description = creator.bio || `Pay ${creator.displayName} with crypto or card via NodeBlink.`;
  const ogImageUrl = `${origin}/pay/${creator.username}/opengraph-image`;

  return {
    title: `Pay ${creator.displayName} | NodeBlink`,
    description,
    openGraph: {
      title: `Pay ${creator.displayName}`,
      description,
      siteName: 'NodeBlink',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Pay ${creator.displayName} on NodeBlink`,
        },
      ],
    },
    twitter: {
      card: 'player',
      title: `Pay ${creator.displayName}`,
      description,
      images: [ogImageUrl],
    },
    other: {
      'twitter:player': `${origin}/embed/pay/${creator.username}`,
      'twitter:player:width': '400',
      'twitter:player:height': '600',
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function DomainPayPage({ params, searchParams }: Props) {
  const { domain } = await params;
  const { product: productId } = await searchParams;
  const origin = await getRequestOrigin();
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') ?? '';
  const mobile = MOBILE_UA.test(userAgent);

  const creator = await getCreatorProfileByDomain(domain);
  if (!creator) notFound();

  const actionApiUrl = `${origin}/api/v1/actions/creator/${encodeURIComponent(creator.username)}`;

  return (
    <>
      <SiteHeader />
      <UniversalPayShell
        creator={creator}
        actionApiUrl={actionApiUrl}
        mobile={mobile}
        productId={productId}
      />
      <SiteFooter />
    </>
  );
}
