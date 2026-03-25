import { Router } from "express";
import { AuthController } from "./auth.controller";

export const authRouter = Router();

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
