import { Router } from "express";
import { routeAccess } from "../../middleware/auth";
import { StatisticsController } from "./statistics.controller";

export const statisticsRouter = Router();

// Admin and Manager routes
statisticsRouter.get("/dashboard", ...routeAccess.adminOrManager, StatisticsController.getDashboardStats);
statisticsRouter.get("/revenue", ...routeAccess.adminOrManager, StatisticsController.getRevenueAnalytics);
