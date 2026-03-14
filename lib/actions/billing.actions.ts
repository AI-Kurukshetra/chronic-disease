'use server';

import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { checkoutSessionSchema } from '@/lib/validations/billing.schema';
import { logServerError } from '@/lib/utils/errors';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function createCheckoutSession(formData: FormData): Promise<{ error?: string }> {
  try {
    const priceId = formData.get('priceId');
    const parsed = checkoutSessionSchema.safeParse({ priceId });

    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? 'Invalid checkout request.' };
    }

    if (!stripeSecretKey) {
      return { error: 'Stripe is not configured.' };
    }

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/login');
    }

    const stripe = new Stripe(stripeSecretKey);
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/dashboard?subscription=success`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/dashboard?subscription=cancelled`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: parsed.data.priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      ...(user.email ? { customer_email: user.email } : {}),
      metadata: {
        userId: user.id,
        plan: parsed.data.priceId,
      },
    });

    if (!session.url) {
      return { error: 'Unable to start checkout session.' };
    }

    redirect(session.url);
  } catch (error) {
    logServerError(error, { action: 'createCheckoutSession' });
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
