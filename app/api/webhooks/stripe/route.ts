import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { logServerError } from '@/lib/utils/errors';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request): Promise<Response> {
  if (!stripeSecretKey || !webhookSecret) {
    return new Response('Stripe not configured', { status: 500 });
  }

  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    logServerError(error, { action: 'stripe.webhook.verify' });
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .maybeSingle();

  if (existingError) {
    logServerError(existingError, { action: 'stripe.webhook.idempotency' });
  }

  if (existing) {
    return Response.json({ received: true, duplicate: true });
  }

  const { error: insertError } = await supabase.from('stripe_events').insert({
    stripe_event_id: event.id,
    type: event.type,
  });

  if (insertError) {
    if (insertError.code === '23505') {
      return Response.json({ received: true, duplicate: true });
    }
    logServerError(insertError, { action: 'stripe.webhook.insertEvent' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(supabase, session);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabase, subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(supabase, subscription);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    logServerError(error, { action: 'stripe.webhook.handleEvent' });
  }

  return Response.json({ received: true });
}

async function handleCheckoutComplete(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.metadata?.userId;
  if (!userId) return;

  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: session.customer as string | null,
    stripe_subscription_id: session.subscription as string | null,
    status: 'active',
    plan: session.metadata?.plan ?? 'patient_monthly',
  });
}

async function handleSubscriptionUpdate(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  subscription: Stripe.Subscription,
): Promise<void> {
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_end: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionCancelled(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  subscription: Stripe.Subscription,
): Promise<void> {
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: true,
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  void invoice;
  return Promise.resolve();
}
