import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { getRequestOriginFromRequest } from '@/lib/request-origin';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json() as { walletAddress?: string };
    if (!walletAddress) {
      return NextResponse.json({ error: 'walletAddress required' }, { status: 400 });
    }

    const creator = await prisma.creatorProfile.findFirst({
      where: { publicKey: walletAddress },
    });
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const stripe = getStripe();
    const origin = getRequestOriginFromRequest(request);

    let stripeAccountId = (creator as { stripeAccountId?: string | null }).stripeAccountId;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        metadata: { walletAddress, creatorId: creator.id },
      });
      stripeAccountId = account.id;

      await prisma.creatorProfile.update({
        where: { id: creator.id },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { stripeAccountId } as any,
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${origin}/dashboard?stripe=refresh`,
      return_url: `${origin}/dashboard?stripe=connected`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('[stripe/connect]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Stripe connect failed' },
      { status: 500 },
    );
  }
}
