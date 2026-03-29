import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { envVars } from "./config/env";
import { authNodeHandler } from "./lib/auth";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { appRouter } from "./routes";

const app = express();
const allowedOrigins = new Set(envVars.TRUSTED_ORIGINS);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      callback(null, allowedOrigins.has(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Stripe webhook requires raw body for signature verification
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.all("/api/auth/*splat", async (req, res) => {
  await authNodeHandler(req, res);
});

app.use(appRouter);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Sylcchi Palace API",
  });
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
