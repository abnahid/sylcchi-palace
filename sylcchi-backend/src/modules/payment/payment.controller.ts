import { Request, Response } from "express";
import status from "http-status";
import { PaymentMethod, PaymentStatus, RefundStatus } from "../../../generated/prisma";
import { AppError } from "../../errorHelpers/AppError";
import { PaymentService } from "./payment.service";

const VALID_STATUSES = new Set(Object.values(PaymentStatus));
const VALID_METHODS = new Set(Object.values(PaymentMethod));
const VALID_REFUND_STATUSES = new Set(Object.values(RefundStatus));

function parseQueryPositiveInt(value: unknown, defaultValue: number): number {
  if (value === undefined) {
    return defaultValue;
  }

  const num = Number(value);

  if (!Number.isInteger(num) || num < 1) {
    return defaultValue;
  }

  return num;
}

export const PaymentController = {
  listPayments: async (req: Request, res: Response) => {
    const page = parseQueryPositiveInt(req.query.page, 1);
    const limitRaw = parseQueryPositiveInt(req.query.limit, 10);
    const limit = Math.min(limitRaw, 100);

    const search =
      typeof req.query.search === "string" && req.query.search.trim()
        ? req.query.search.trim()
        : undefined;

    const statusFilter =
      typeof req.query.status === "string" && VALID_STATUSES.has(req.query.status as PaymentStatus)
        ? (req.query.status as PaymentStatus)
        : undefined;

    const paymentMethod =
      typeof req.query.paymentMethod === "string" &&
      VALID_METHODS.has(req.query.paymentMethod as PaymentMethod)
        ? (req.query.paymentMethod as PaymentMethod)
        : undefined;

    const refundStatus =
      typeof req.query.refundStatus === "string" &&
      VALID_REFUND_STATUSES.has(req.query.refundStatus as RefundStatus)
        ? (req.query.refundStatus as RefundStatus)
        : undefined;

    const result = await PaymentService.listPayments({
      page,
      limit,
      status: statusFilter,
      paymentMethod,
      refundStatus,
      search,
    });

    res.status(status.OK).json({
      success: true,
      message: "Payments retrieved successfully",
      data: result,
    });
  },

  getPaymentById: async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Payment ID is required", status.BAD_REQUEST);
    }

    const payment = await PaymentService.getPaymentById(id);

    if (!payment) {
      throw new AppError("Payment not found", status.NOT_FOUND);
    }

    res.status(status.OK).json({
      success: true,
      message: "Payment retrieved successfully",
      data: payment,
    });
  },
};
