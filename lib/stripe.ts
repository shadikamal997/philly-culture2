import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

// The Stripe account is shared with another business. Spread into every
// checkout.sessions.create call so Philly Culture's sessions opt out of the
// account's Managed Payments default (it rejects payment_method_types and
// untaxed line items) and show our name on Checkout and card statements
// instead of the account's. stripe@20.4.0 has no type for managed_payments yet.
export const CHECKOUT_SESSION_DEFAULTS = {
  managed_payments: { enabled: false },
  branding_settings: { display_name: "Philly Culture" },
  payment_intent_data: { statement_descriptor_suffix: "PHILLY CULTURE" },
} as Record<never, never>;
