import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { generateAuthTokens, verifyRefreshToken } from "../../utils/jwt";

type AuthApi = typeof auth.api;

const DEFAULT_PROFILE_IMAGE_URL = "https://i.ibb.co.com/7tsGL68c/blob.webp";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  emailVerified: boolean;
  tokenVersion: number;
};

async function getUserByEmail(email: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      emailVerified: true,
      tokenVersion: true,
    },
  });

  if (!user) {
    throw new Error("User not found after auth action");
  }

  return {
    ...user,
    role: String(user.role),
  };
}

function buildAuthResponse(user: AuthUser) {
  const tokens = generateAuthTokens({
    sub: user.id,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    tokenVersion: user.tokenVersion,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      emailVerified: user.emailVerified,
    },
    ...tokens,
  };
}

export const AuthService = {
  signUp: async (
    payload: { name: string; email: string; password: string },
    headers: Headers,
  ) => {
    await (auth.api as AuthApi).signUpEmail({
      body: payload,
      headers,
    });

    await prisma.user.updateMany({
      where: {
        email: payload.email,
        image: null,
      },
      data: {
        image: DEFAULT_PROFILE_IMAGE_URL,
      },
    });

    const user = await getUserByEmail(payload.email);
    return buildAuthResponse(user);
  },

  signIn: async (
    payload: { email: string; password: string },
    headers: Headers,
  ) => {
    await (auth.api as AuthApi).signInEmail({
      body: payload,
      headers,
    });

    const user = await getUserByEmail(payload.email);
    return buildAuthResponse(user);
  },

  signOut: async (headers: Headers, userId?: string) => {
    await (auth.api as AuthApi).signOut({ headers });

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          tokenVersion: {
            increment: 1,
          },
        },
      });
    }

    return { success: true };
  },

  getSession: async (headers: Headers) => {
    return (auth.api as AuthApi).getSession({ headers });
  },

  requestVerificationOtp: async (email: string, type: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      throw new AppError("Email does not exist", status.NOT_FOUND);
    }

    return (auth.api as AuthApi).sendVerificationOTP({
      body: {
        email,
        type: type as "email-verification" | "sign-in" | "forget-password",
      },
    });
  },

  verifyEmailOtp: async (
    payload: { email: string; otp: string },
    headers: Headers,
  ) => {
    await (auth.api as AuthApi).verifyEmailOTP({
      body: payload,
      headers,
    });

    const user = await getUserByEmail(payload.email);
    return buildAuthResponse(user);
  },

  refreshToken: async (refreshToken: string) => {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        emailVerified: true,
        tokenVersion: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      throw new Error("Refresh token revoked");
    }

    return buildAuthResponse({
      ...user,
      role: String(user.role),
    });
  },

  resetPassword: async (payload: {
    email: string;
    otp: string;
    password: string;
  }) => {
    return (auth.api as AuthApi).resetPasswordEmailOTP({
      body: {
        email: payload.email,
        otp: payload.otp,
        password: payload.password,
      },
    });
  },
};
