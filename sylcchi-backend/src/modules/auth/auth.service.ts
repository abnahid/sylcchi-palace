import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

type AuthApi = typeof auth.api;

const DEFAULT_PROFILE_IMAGE_URL = "https://i.ibb.co.com/7tsGL68c/blob.webp";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  emailVerified: boolean;
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
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  };
}

export const AuthService = {
  signUp: async (
    payload: { name: string; email: string; password: string },
    headers: Headers,
  ) => {
    const signUpResult = await (auth.api as AuthApi).signUpEmail({
      body: payload,
      headers,
      asResponse: false,
      returnHeaders: true,
      returnStatus: false,
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
    return {
      ...buildAuthResponse(user),
      headers:
        signUpResult &&
        typeof signUpResult === "object" &&
        "headers" in signUpResult
          ? (signUpResult as { headers?: Headers }).headers
          : undefined,
    };
  },

  signIn: async (
    payload: { email: string; password: string },
    headers: Headers,
  ) => {
    const signInResult = await (auth.api as AuthApi).signInEmail({
      body: payload,
      headers,
      asResponse: false,
      returnHeaders: true,
      returnStatus: false,
    });

    const user = await getUserByEmail(payload.email);
    return {
      ...buildAuthResponse(user),
      headers:
        signInResult &&
        typeof signInResult === "object" &&
        "headers" in signInResult
          ? (signInResult as { headers?: Headers }).headers
          : undefined,
    };
  },

  signOut: async (headers: Headers) => {
    const signOutResult = await (auth.api as AuthApi).signOut({
      headers,
      asResponse: false,
      returnHeaders: true,
      returnStatus: false,
    });

    return {
      success: true,
      headers:
        signOutResult &&
        typeof signOutResult === "object" &&
        "headers" in signOutResult
          ? (signOutResult as { headers?: Headers }).headers
          : undefined,
    };
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
    const verifyResult = await (auth.api as AuthApi).verifyEmailOTP({
      body: payload,
      headers,
      asResponse: false,
      returnHeaders: true,
      returnStatus: false,
    });

    const user = await getUserByEmail(payload.email);
    return {
      ...buildAuthResponse(user),
      headers:
        verifyResult &&
        typeof verifyResult === "object" &&
        "headers" in verifyResult
          ? (verifyResult as { headers?: Headers }).headers
          : undefined,
    };
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
