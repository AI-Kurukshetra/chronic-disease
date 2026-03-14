# SKILL: Stripe Billing & Subscriptions

## HealthOS Agent Skill File

**Read this before any billing, subscription, or payment task.**

---

## Key Rules

- Stripe webhook handler MUST be idempotent — handle duplicate events safely
- Never store raw card data — Stripe handles PCI compliance
- Subscription status synced to Supabase on every webhook event
- Use Stripe Checkout for new subscriptions — never build a custom payment form

---

## Stripe Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Service role client — webhooks are unauthenticated (no user session)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  // Idempotency: check if this event was already processed
  const { data: existing } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single();

  if (existing) {
    return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
  }

  // Record event before processing (idempotency guard)
  await supabase.from('stripe_events').insert({ stripe_event_id: event.id, type: event.type });

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(sub);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancelled(sub);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: session.subscription as string,
    status: 'active',
    plan: session.metadata?.plan ?? 'patient_monthly',
  });
}

async function handleSubscriptionUpdate(sub: Stripe.Subscription) {
  await supabase
    .from('subscriptions')
    .update({ status: sub.status, updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', sub.id);
}

async function handleSubscriptionCancelled(sub: Stripe.Subscription) {
  await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', sub.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Send email via Resend — do not expose stripe details to logs
  console.log('[PaymentFailed] Customer:', invoice.customer);
  // ... send Resend email
}
```

---

## Create Checkout Session Server Action

```typescript
// lib/actions/billing.actions.ts
'use server';

import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(priceId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: {
      userId: user.id,
      plan: priceId,
    },
    customer_email: user.email,
  });

  redirect(session.url!);
}
```
