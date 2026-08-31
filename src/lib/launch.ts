/**
 * One deliberate release switch for the public beta. Keep billing fail-closed
 * until Stripe verification, test checkout, and the paid-launch review pass.
 */
export const BILLING_ENABLED = false;

export const BETA_ASSESSMENT_COPY = "1 private assessment every 30 days";
