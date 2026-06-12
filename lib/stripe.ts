import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? '';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  if (!_stripe) {
    _stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-05-27.dahlia' as any,
    });
  }
  return _stripe;
}

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

export async function createStripeCheckoutSession(params: {
  productTitle: string;
  productDescription?: string;
  amountCents: number;
  currency: string;
  creatorStripeAccountId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: params.currency.toLowerCase(),
          product_data: {
            name: params.productTitle,
            description: params.productDescription,
          },
          unit_amount: params.amountCents,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    payment_intent_data: {
      application_fee_amount: Math.round(params.amountCents * 0.05), // 5% NodeBlink routing margin
      transfer_data: {
        destination: params.creatorStripeAccountId,
      },
    },
  });

  return session;
}

export async function createStripeConnectAccountLink(params: {
  stripeAccountId: string;
  refreshUrl: string;
  returnUrl: string;
}) {
  const stripe = getStripe();
  const accountLink = await stripe.accountLinks.create({
    account: params.stripeAccountId,
    refresh_url: params.refreshUrl,
    return_url: params.returnUrl,
    type: 'account_onboarding',
  });
  return accountLink;
}

export async function getOrCreateStripeConnectAccount(
  walletAddress: string,
): Promise<string> {
  const stripe = getStripe();
  // Use wallet address as external metadata for lookup
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _existing = await stripe.accounts.list({ limit: 1 });
  // For simplicity, create a new Express account.
  // In production, store stripeAccountId in DB per creator and look it up first.
  const account = await stripe.accounts.create({
    type: 'express',
    metadata: { walletAddress },
  });
  return account.id;
}
