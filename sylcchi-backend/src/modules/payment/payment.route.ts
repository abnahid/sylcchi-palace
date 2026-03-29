import { Router } from "express";
import { routeAccess } from "../../middleware/auth";
import { PaymentController } from "./payment.controller";

export const paymentRouter = Router();

// Admin-only routes
paymentRouter.get("/", ...routeAccess.admin, PaymentController.listPayments);
paymentRouter.get("/:id", ...routeAccess.admin, PaymentController.getPaymentById);
