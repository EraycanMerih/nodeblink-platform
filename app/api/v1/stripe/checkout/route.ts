import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

const schema = z.object({
  walletAddress: z.string().min(1),
  productId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const { walletAddress, productId, successUrl, cancelUrl } = parsed.data;

    const product = await prisma.digitalAsset.findUnique({
      where: { id: productId },
      include: { creatorProfile: true },
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const stripeAccountId = (product.creatorProfile as { stripeAccountId?: string | null }).stripeAccountId;
    if (!stripeAccountId) {
      return NextResponse.json(
        { error: 'This creator has not enabled card payments yet.' },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    // Convert lamports to USD cents (approximate — in production use a live SOL price feed)
    // For fiat products, priceMinorUnits is stored as cents directly when currency is USD
    const priceInCents = Number(product.priceMinorUnits);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.title,
              description: product.description ?? undefined,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        productId,
        walletAddress,
        creatorProfileId: product.creatorProfileId,
        platformFeeBps: product.creatorProfile.platformFeeBps.toString(),
      },
      payment_intent_data: {
        application_fee_amount: Math.round(priceInCents * (product.creatorProfile.platformFeeBps / 10000)),
        transfer_data: { destination: stripeAccountId },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[stripe/checkout]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 },
    );
  }
}
