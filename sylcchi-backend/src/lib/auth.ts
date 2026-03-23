import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { toNodeHandler } from "better-auth/node";
import { bearer, emailOTP } from "better-auth/plugins";
import { envVars } from "../config/env";
import { sendEmail } from "../utils/email";
import { prisma } from "./prisma";

const baseURL = envVars.BETTER_AUTH_URL;
const oneDayInSeconds = 60 * 60 * 24;

const googleProvider =
  envVars.GOOGLE_CLIENT_ID && envVars.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: envVars.GOOGLE_CLIENT_ID,
          clientSecret: envVars.GOOGLE_CLIENT_SECRET,
          mapProfileToUser: () => ({
            role: "CUSTOMER",
          }),
        },
      }
    : undefined;

export const auth = betterAuth({
  baseURL,
  secret: envVars.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: googleProvider,
  emailVerification: {
    sendOnSignUp: false,
    sendOnSignIn: false,
    autoSignInAfterVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "CUSTOMER",
      },
    },
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        const user = await prisma.user.findUnique({ where: { email } });
        const name = user?.name ?? "there";

        if (type === "email-verification") {
          await sendEmail({
            to: email,
            subject: "Verify your email – Sylcchi Palace",
            html: `<p>Hello ${name},</p><p>Your email verification code is: <b>${otp}</b></p><p>This code expires in 2 minutes.</p>`,
          });
          return;
        }

        if (type === "sign-in") {
          await sendEmail({
            to: email,
            subject: "Sign-in OTP – Sylcchi Palace",
            html: `<p>Hello ${name},</p><p>Your sign-in code is: <b>${otp}</b></p><p>This code expires in 2 minutes.</p>`,
          });
          return;
        }

        if (type === "forget-password") {
          await sendEmail({
            to: email,
            subject: "Password reset OTP – Sylcchi Palace",
            html: `<p>Hello ${name},</p><p>Your password reset code is: <b>${otp}</b></p><p>This code expires in 2 minutes.</p>`,
          });
        }
      },
      expiresIn: 2 * 60,
      otpLength: 6,
    }),
  ],
  session: {
    expiresIn: oneDayInSeconds,
    updateAge: oneDayInSeconds,
    cookieCache: {
      enabled: true,
      maxAge: oneDayInSeconds,
    },
  },
  trustedOrigins: [baseURL, envVars.FRONTEND_URL],
  advanced: {
    database: {
      generateId: "uuid",
    },
    useSecureCookies: envVars.NODE_ENV === "production",
    cookies:
      envVars.NODE_ENV === "production"
        ? {
            state: {
              attributes: {
                sameSite: "none",
                secure: true,
                httpOnly: true,
                path: "/",
              },
            },
            sessionToken: {
              attributes: {
                sameSite: "none",
                secure: true,
                httpOnly: true,
                path: "/",
              },
            },
          }
        : {
            sessionToken: {
              attributes: {
                sameSite: "lax",
                secure: false,
                httpOnly: true,
                path: "/",
              },
            },
          },
  },
});

export const authNodeHandler = toNodeHandler(auth);
