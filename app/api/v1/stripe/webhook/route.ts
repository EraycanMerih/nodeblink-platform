import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const sig = request.headers.get('stripe-signature');
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig ?? '', webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { productId, walletAddress, creatorProfileId } = session.metadata ?? {};

    if (productId && creatorProfileId) {
      await prisma.transaction.create({
        data: {
          signature: session.payment_intent as string,
          creatorProfileId,
          productId,
          senderWallet: walletAddress ?? 'stripe',
          recipientWallet: 'stripe',
          grossAmount: (session.amount_total ?? 0) / 100,
          feeAmount: ((session.amount_total ?? 0) * (Number(session.metadata?.platformFeeBps || 250) / 10000)) / 100,
          currency: 'SOL', // Stored as SOL equivalent; in prod use USD enum
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          metadata: { stripeSessionId: session.id, paymentMethod: 'card' },
        },
      });

      const email = session.customer_details?.email;
      if (email) {
        const asset = await prisma.digitalAsset.findUnique({ where: { id: productId }, include: { creatorProfile: true } });
        if (asset && asset.storageUrl) {
          const { decryptBase64 } = await import('@/lib/crypto');
          const { sendPurchaseEmail } = await import('@/lib/email');
          const { PUBLIC_BASE_URL } = await import('@/lib/env');
          const key = asset.encryptedKey ? decryptBase64(asset.encryptedKey) : undefined;
          const downloadUrl = asset.storageUrl.startsWith('http') ? asset.storageUrl : `${PUBLIC_BASE_URL}${asset.storageUrl}`;
          await sendPurchaseEmail({
            toEmail: email,
            productTitle: asset.title,
            creatorName: asset.creatorProfile.displayName,
            downloadUrl,
            decryptionKey: key,
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
