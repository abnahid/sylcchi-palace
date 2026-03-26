import { Router } from "express";
import { WebhookController } from "./webhook.controller";

export const webhookRouter = Router();

webhookRouter.post("/stripe", WebhookController.handleStripeWebhook);
webhookRouter.post(
  "/sslcommerz/success",
  WebhookController.handleSslCommerzSuccess,
);
webhookRouter.post("/sslcommerz/fail", WebhookController.handleSslCommerzFail);
webhookRouter.post(
  "/sslcommerz/cancel",
  WebhookController.handleSslCommerzCancel,
);
webhookRouter.post("/sslcommerz/ipn", WebhookController.handleSslCommerzIpn);
