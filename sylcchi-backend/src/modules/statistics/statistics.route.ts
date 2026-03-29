import { Router } from "express";
import { routeAccess } from "../../middleware/auth";
import { StatisticsController } from "./statistics.controller";

export const statisticsRouter = Router();

// Admin-only routes
statisticsRouter.get("/dashboard", ...routeAccess.admin, StatisticsController.getDashboardStats);
statisticsRouter.get("/revenue", ...routeAccess.admin, StatisticsController.getRevenueAnalytics);
