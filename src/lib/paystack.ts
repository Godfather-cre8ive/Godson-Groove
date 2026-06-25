import crypto from 'crypto';

const PAYSTACK_BASE = 'https://api.paystack.co';
const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

async function paystackRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: object
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message || 'Paystack request failed');
  }
  return data.data;
}

export interface InitializePaymentParams {
  email: string;
  amount: number; // in kobo (multiply NGN by 100)
  reference?: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
  channels?: string[];
}

export interface InitializePaymentResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializePayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResult> {
  return paystackRequest<InitializePaymentResult>('/transaction/initialize', 'POST', {
    email: params.email,
    amount: Math.round(params.amount * 100), // convert to kobo
    reference: params.reference,
    callback_url: params.callbackUrl,
    metadata: params.metadata,
    channels: params.channels || ['card', 'bank', 'ussd', 'bank_transfer'],
  });
}

export interface VerifyPaymentResult {
  id: number;
  reference: string;
  status: string; // 'success' | 'failed' | 'abandoned'
  amount: number; // in kobo
  currency: string;
  customer: {
    email: string;
    customer_code: string;
  };
  metadata?: Record<string, unknown>;
  paid_at?: string;
}

export async function verifyPayment(reference: string): Promise<VerifyPaymentResult> {
  return paystackRequest<VerifyPaymentResult>(`/transaction/verify/${reference}`);
}

export interface CreateSubscriptionParams {
  email: string;
  planCode: string;
  amount?: number;
  metadata?: Record<string, unknown>;
}

export async function createSubscriptionLink(
  params: CreateSubscriptionParams
): Promise<InitializePaymentResult> {
  return paystackRequest<InitializePaymentResult>('/transaction/initialize', 'POST', {
    email: params.email,
    plan: params.planCode,
    amount: params.amount ? Math.round(params.amount * 100) : undefined,
    metadata: params.metadata,
  });
}

export async function cancelSubscription(subscriptionCode: string, token: string): Promise<boolean> {
  const result = await paystackRequest<{ status: boolean }>(
    '/subscription/disable',
    'POST',
    { code: subscriptionCode, token }
  );
  return Boolean(result);
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', SECRET_KEY)
    .update(payload)
    .digest('hex');
  return hash === signature;
}

export async function getSubscriptionDetails(subscriptionCode: string) {
  return paystackRequest(`/subscription/${subscriptionCode}`);
}
