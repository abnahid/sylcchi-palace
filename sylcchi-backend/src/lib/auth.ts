import { envVars } from "../config/env";
import { sendEmail } from "../utils/email";
import { buildOtpEmailTemplate } from "../utils/emailTemplates";
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

type BetterAuthInstance = {
  api: Record<string, unknown>;
};

type AuthNodeHandler = (req: unknown, res: unknown) => Promise<unknown>;

let authPromise: Promise<BetterAuthInstance> | null = null;
let authNodeHandlerPromise: Promise<AuthNodeHandler> | null = null;

async function createAuth(): Promise<BetterAuthInstance> {
  const [{ betterAuth }, { prismaAdapter }, { bearer, emailOTP }] =
    await Promise.all([
      import("better-auth"),
      import("better-auth/adapters/prisma"),
      import("better-auth/plugins"),
    ]);

  return betterAuth({
    baseURL,
    secret: envVars.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
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

          const otpType =
            type === "email-verification" ||
            type === "sign-in" ||
            type === "forget-password"
              ? type
              : "sign-in";

          const emailContent = buildOtpEmailTemplate({
            recipientName: name,
            otp,
            type: otpType,
            expiresInMinutes: 2,
          });

          await sendEmail({
            to: email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            replyTo: envVars.SUPPORT_EMAIL,
          });
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
    trustedOrigins: envVars.TRUSTED_ORIGINS,
    advanced: {
      database: {
        generateId: "uuid",
      },
      useSecureCookies: envVars.NODE_ENV === "production",
      defaultCookieAttributes:
        envVars.NODE_ENV === "production"
          ? {
              sameSite: "none" as const,
              secure: true,
              httpOnly: true,
              path: "/",
            }
          : {
              sameSite: "lax" as const,
              secure: false,
              httpOnly: true,
              path: "/",
            },
    },
  }) as BetterAuthInstance;
}

export async function getAuth(): Promise<BetterAuthInstance> {
  if (!authPromise) {
    authPromise = createAuth();
  }

  return authPromise;
}

async function getAuthNodeHandler(): Promise<AuthNodeHandler> {
  if (!authNodeHandlerPromise) {
    authNodeHandlerPromise = (async () => {
      const [{ toNodeHandler }, auth] = await Promise.all([
        import("better-auth/node"),
        getAuth(),
      ]);

      return toNodeHandler(auth) as AuthNodeHandler;
    })();
  }

  return authNodeHandlerPromise;
}

export async function authNodeHandler(req: unknown, res: unknown) {
  const handler = await getAuthNodeHandler();
  return handler(req, res);
}
