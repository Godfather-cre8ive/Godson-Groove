import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/paystack';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature') || '';

    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const { event: eventType, data } = event;

    switch (eventType) {
      case 'charge.success': {
        const reference = data.reference;
        const metadata = data.metadata as Record<string, string>;

        await prisma.payment.updateMany({
          where: { providerRef: reference },
          data: { status: 'SUCCESS', paidAt: new Date() },
        });
        break;
      }

      case 'subscription.disable': {
        const subscriptionCode = data.subscription_code;
        await prisma.subscription.updateMany({
          where: { providerRef: subscriptionCode },
          data: { status: 'CANCELLED', cancelledAt: new Date() },
        });
        break;
      }

      case 'subscription.not_renew': {
        const subscriptionCode = data.subscription_code;
        await prisma.subscription.updateMany({
          where: { providerRef: subscriptionCode },
          data: { status: 'PAST_DUE' },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const subscriptionCode = data.subscription?.subscription_code;
        if (subscriptionCode) {
          await prisma.subscription.updateMany({
            where: { providerRef: subscriptionCode },
            data: { status: 'PAST_DUE' },
          });
          // Downgrade user role
          const sub = await prisma.subscription.findFirst({
            where: { providerRef: subscriptionCode },
          });
          if (sub) {
            await prisma.user.update({
              where: { id: sub.userId },
              data: { role: 'FREE_USER' },
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Paystack Webhook]', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
