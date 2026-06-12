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
  params: Promise<{ username: string; productId: string }>;
}

function formatPrice(amountMinorUnits: number, currency: string): string {
  if (currency === 'USD') return `$${(amountMinorUnits / 100).toFixed(2)}`;
  if (currency === 'USDC') return `${(amountMinorUnits / 1_000_000).toFixed(2)} USDC`;
  const sol = amountMinorUnits / 1_000_000_000;
  return `${sol.toFixed(sol < 1 ? 2 : 1)} SOL`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, productId } = await params;
  const origin = await getRequestOrigin();
  const creator = await getCreatorProfile(username);
  const product = creator.products.find((p) => p.id === productId);

  if (!product) {
    return {
      title: `Pay ${creator.displayName} | NodeBlink`,
      description: creator.bio || `Pay ${creator.displayName} with crypto or card via NodeBlink.`,
    };
  }

  const price = formatPrice(product.priceMinorUnits, product.currency);
  const title = `${product.title} — ${price} | ${creator.displayName}`;
  const description = product.description || `Buy ${product.title} for ${price} from ${creator.displayName}. Pay with crypto or card.`;

  return {
    title,
    description,
    openGraph: {
      title: `${product.title} — ${price}`,
      description,
      siteName: 'NodeBlink',
      type: 'website',
      images: [
        {
          url: `${origin}/pay/${username}/${productId}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${product.title} by ${creator.displayName}`,
        },
      ],
    },
    twitter: {
      card: 'player',
      title: `${product.title} — ${price}`,
      description,
      images: [`${origin}/pay/${username}/${productId}/opengraph-image`],
    },
    other: {
      'twitter:player': `${origin}/embed/pay/${username}/${productId}`,
      'twitter:player:width': '400',
      'twitter:player:height': '600',
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function ProductPayPage({ params }: Props) {
  const { username, productId } = await params;
  const origin = await getRequestOrigin();
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') ?? '';
  const mobile = MOBILE_UA.test(userAgent);

  const creator = await getCreatorProfile(username);
  const product = creator.products.find((p) => p.id === productId);
  if (!product) notFound();

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
