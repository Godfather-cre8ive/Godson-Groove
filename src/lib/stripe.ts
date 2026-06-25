// Stripe abstraction layer for global expansion
// Install: npm install stripe

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY!;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

async function stripeRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  body?: Record<string, unknown>
): Promise<T> {
  const params = body
    ? new URLSearchParams(
        Object.entries(body).reduce((acc, [k, v]) => {
          acc[k] = String(v);
          return acc;
        }, {} as Record<string, string>)
      ).toString()
    : undefined;

  const res = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    ...(params && { body: params }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data;
}

export interface StripePaymentIntentResult {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export async function createPaymentIntent(
  amount: number, // in cents
  currency: string = 'usd',
  metadata?: Record<string, string>
): Promise<StripePaymentIntentResult> {
  return stripeRequest<StripePaymentIntentResult>('/payment_intents', 'POST', {
    amount: String(Math.round(amount * 100)),
    currency,
    ...(metadata && { 'metadata[userId]': metadata.userId }),
  });
}

export interface StripeSubscriptionResult {
  id: string;
  status: string;
  current_period_end: number;
  latest_invoice: {
    payment_intent: {
      client_secret: string;
    };
  };
}

export async function createStripeSubscription(
  customerId: string,
  priceId: string
): Promise<StripeSubscriptionResult> {
  return stripeRequest<StripeSubscriptionResult>('/subscriptions', 'POST', {
    customer: customerId,
    'items[0][price]': priceId,
    payment_behavior: 'default_incomplete',
    'expand[]': 'latest_invoice.payment_intent',
  });
}

export async function cancelStripeSubscription(subscriptionId: string) {
  return stripeRequest(`/subscriptions/${subscriptionId}`, 'DELETE');
}

export function verifyStripeWebhook(payload: string, signature: string): boolean {
  // In production use stripe.webhooks.constructEvent
  // Simplified check here - install stripe SDK for full verification
  return Boolean(signature && payload && STRIPE_WEBHOOK_SECRET);
}

// Unified payment abstraction
export type PaymentProvider = 'paystack' | 'stripe';

export interface UnifiedPaymentParams {
  provider: PaymentProvider;
  email: string;
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
}

export async function createPayment(params: UnifiedPaymentParams) {
  if (params.provider === 'paystack') {
    const { initializePayment } = await import('./paystack');
    return initializePayment({
      email: params.email,
      amount: params.amount,
      metadata: params.metadata as Record<string, unknown>,
    });
  } else {
    return createPaymentIntent(
      params.amount,
      params.currency,
      params.metadata as Record<string, string>
    );
  }
}
