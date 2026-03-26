import { Request, Response } from "express";
import status from "http-status";
import { envVars } from "../../config/env";
import { AppError } from "../../errorHelpers/AppError";
import { WebhookService } from "./webhook.service";

function getPayload(req: Request): Record<string, unknown> {
  if (req.body && typeof req.body === "object") {
    return req.body as Record<string, unknown>;
  }

  return Object.fromEntries(
    Object.entries(req.query).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
}

export const WebhookController = {
  handleStripeWebhook: async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];

    if (!signature || typeof signature !== "string") {
      throw new AppError("Missing Stripe signature", status.BAD_REQUEST);
    }

    if (!Buffer.isBuffer(req.body)) {
      throw new AppError("Missing webhook body", status.BAD_REQUEST);
    }

    try {
      await WebhookService.processStripeWebhook(req.body, signature);
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }

      if (err instanceof Error && err.message.includes("signature")) {
        throw new AppError("Invalid Stripe signature", status.UNAUTHORIZED);
      }

      throw new AppError(
        "Webhook processing failed",
        status.INTERNAL_SERVER_ERROR,
      );
    }

    res.status(status.OK).json({
      received: true,
    });
  },

  handleSslCommerzSuccess: async (req: Request, res: Response) => {
    const payload = getPayload(req);
    const result = await WebhookService.processSslCommerzWebhook(
      payload,
      "success",
    );

    res.redirect(status.SEE_OTHER, result.redirectUrl);
  },

  handleSslCommerzFail: async (req: Request, res: Response) => {
    const payload = getPayload(req);
    const result = await WebhookService.processSslCommerzWebhook(
      payload,
      "failed",
    );

    res.redirect(status.SEE_OTHER, result.redirectUrl);
  },

  handleSslCommerzCancel: async (req: Request, res: Response) => {
    const payload = getPayload(req);
    const result = await WebhookService.processSslCommerzWebhook(
      payload,
      "cancel",
    );

    res.redirect(status.SEE_OTHER, result.redirectUrl);
  },

  handleSslCommerzIpn: async (_req: Request, res: Response) => {
    // Keep an explicit IPN endpoint reserved for future asynchronous validation.
    res.status(status.OK).json({
      success: true,
      message: `IPN endpoint is active at ${envVars.BETTER_AUTH_URL}/api/webhooks/sslcommerz/ipn`,
    });
  },
};
