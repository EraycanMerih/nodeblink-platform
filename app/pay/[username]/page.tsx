import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { UniversalPayShell } from '@/components/universal-pay-shell';
import { getCreatorProfile } from '@/lib/creator-actions';
import { getRequestOrigin } from '@/lib/request-origin';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

interface Props {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ product?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const origin = await getRequestOrigin();
  const creator = await getCreatorProfile(username);
  const description = creator.bio || `Pay ${creator.displayName} with crypto or card via NodeBlink.`;
  const ogImageUrl = `${origin}/pay/${username}/opengraph-image`;

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
      card: 'summary_large_image',
      title: `Pay ${creator.displayName}`,
      description,
      images: [ogImageUrl],
    },
    other: {
      'solana-action': `${origin}/api/v1/actions/creator/${username}`,
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function UniversalPayPage({ params, searchParams }: Props) {
  const { username } = await params;
  const { product: productId } = await searchParams;
  const origin = await getRequestOrigin();
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') ?? '';
  const mobile = MOBILE_UA.test(userAgent);

  const creator = await getCreatorProfile(username);

  const actionApiUrl = `${origin}/api/v1/actions/creator/${encodeURIComponent(username)}`;

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
