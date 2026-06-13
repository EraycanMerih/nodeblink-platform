import { UniversalPayShell } from '@/components/universal-pay-shell';
import { getCreatorProfile } from '@/lib/creator-actions';
import { getRequestOrigin } from '@/lib/request-origin';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

const MOBILE_UA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

interface Props {
  params: Promise<{ username: string; productId: string }>;
  searchParams: Promise<{ u?: string; p?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function EmbedProductPayPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const username = resolvedSearch.u || resolvedParams.username;
  const productId = resolvedSearch.p || resolvedParams.productId;
  const origin = await getRequestOrigin();
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') ?? '';
  const mobile = MOBILE_UA.test(userAgent);

  const creator = await getCreatorProfile(username);
  const product = creator.products.find((p) => p.id === productId);
  if (!product) notFound();

  const actionApiUrl = `${origin}/api/v1/actions/creator/${encodeURIComponent(username)}`;

  return (
    <UniversalPayShell
      creator={creator}
      actionApiUrl={actionApiUrl}
      mobile={mobile}
      productId={productId}
      isEmbed={true}
    />
  );
}
