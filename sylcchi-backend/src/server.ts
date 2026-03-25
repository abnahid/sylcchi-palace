import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { envVars } from "./config/env";
import { authNodeHandler } from "./lib/auth";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";
import { startReservationExpiryScheduler } from "./modules/reservation/reservation.scheduler";
import { appRouter } from "./routes";

const app = express();

app.use(
  cors({
    origin: [envVars.BETTER_AUTH_URL, envVars.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Stripe webhook requires raw body for signature verification
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));

app.use(express.json());
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

const PORT = envVars.PORT;

app.listen(PORT, () => {
  startReservationExpiryScheduler();
  console.log(`Server running on port ${PORT}`);
});
