import { Request, Response } from "express";
import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { WebhookService } from "./webhook.service";

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
};
