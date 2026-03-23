import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route";

export const appRouter = Router();

appRouter.use("/api/v1/auth", authRouter);
