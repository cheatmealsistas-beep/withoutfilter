import Stripe from 'stripe';

// Stripe is optional for free-tier apps like Without Filter
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  : null;

export type { Stripe };
