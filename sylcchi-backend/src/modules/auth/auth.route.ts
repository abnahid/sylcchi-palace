import { Request, Response, Router } from "express";
import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { AuthController } from "./auth.controller";

export const authRouter = Router();

authRouter.get("/demo-credentials", (_req: Request, res: Response) => {
  if (process.env.DEMO_MODE !== "true") {
    throw new AppError("Demo mode is disabled", status.NOT_FOUND);
  }

  const accounts = [
    {
      role: "Admin",
      email: process.env.DEMO_ADMIN_EMAIL,
      password: process.env.DEMO_ADMIN_PASSWORD,
    },
    {
      role: "Manager",
      email: process.env.DEMO_MANAGER_EMAIL,
      password: process.env.DEMO_MANAGER_PASSWORD,
    },
  ].filter((a) => a.email && a.password);

  if (accounts.length === 0) {
    throw new AppError(
      "Demo credentials are not configured on the server",
      status.SERVICE_UNAVAILABLE,
    );
  }

  res.status(status.OK).json({
    success: true,
    message: "Demo credentials retrieved",
    data: { accounts },
  });
});

authRouter.post("/sign-up", AuthController.signUp);
authRouter.post("/sign-in", AuthController.signIn);
authRouter.post("/sign-out", AuthController.signOut);
authRouter.get("/session", AuthController.getSession);

authRouter.post(
  "/request-verification-otp",
  AuthController.requestVerificationOtp,
);
authRouter.post("/verify-otp", AuthController.verifyEmailOtp);

authRouter.post("/forgot-password", AuthController.forgotPassword);
authRouter.post("/reset-password", AuthController.resetPassword);
