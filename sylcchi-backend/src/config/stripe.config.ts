import { envVars } from "./env";

export const stripeConfig = {
  secretKey: envVars.STRIPE_SECRET_KEY,
  publishableKey: envVars.STRIPE_PUBLIC_KEY,
  webhookSecret: envVars.STRIPE_WEBHOOK_SECRET,
  currency: envVars.STRIPE_CURRENCY,
};

export function isStripeConfigured(): boolean {
  return !!(stripeConfig.secretKey && stripeConfig.publishableKey);
}

export function isStripeWebhookConfigured(): boolean {
  return !!(
    stripeConfig.webhookSecret &&
    !stripeConfig.webhookSecret.includes("placeholder")
  );
}
