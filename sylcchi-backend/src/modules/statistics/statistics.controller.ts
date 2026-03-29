import { Request, Response } from "express";
import status from "http-status";
import { StatisticsService } from "./statistics.service";

export const StatisticsController = {
  getDashboardStats: async (_req: Request, res: Response) => {
    const stats = await StatisticsService.getDashboardStats();

    res.status(status.OK).json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: stats,
    });
  },

  getRevenueAnalytics: async (req: Request, res: Response) => {
    const monthsRaw = Number(req.query.months);
    const months =
      Number.isInteger(monthsRaw) && monthsRaw >= 1 && monthsRaw <= 24
        ? monthsRaw
        : 12;

    const data = await StatisticsService.getRevenueAnalytics(months);

    res.status(status.OK).json({
      success: true,
      message: "Revenue analytics retrieved successfully",
      data,
    });
  },
};
