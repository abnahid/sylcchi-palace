import status from "http-status";
import { AppError } from "../../errorHelpers/AppError";
import { getAuth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

type AuthApi = Awaited<ReturnType<typeof getAuth>>["api"];

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
    const authApi = (await getAuth()).api as AuthApi;
    const signUpResult = await authApi.signUpEmail({
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
    const authApi = (await getAuth()).api as AuthApi;
    const signInResult = await authApi.signInEmail({
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
    const authApi = (await getAuth()).api as AuthApi;
    const signOutResult = await authApi.signOut({
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
    const authApi = (await getAuth()).api as AuthApi;
    return authApi.getSession({ headers });
  },

  requestVerificationOtp: async (email: string, type: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      throw new AppError("Email does not exist", status.NOT_FOUND);
    }

    const authApi = (await getAuth()).api as AuthApi;
    return authApi.sendVerificationOTP({
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
    const authApi = (await getAuth()).api as AuthApi;
    const verifyResult = await authApi.verifyEmailOTP({
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
    const authApi = (await getAuth()).api as AuthApi;
    return authApi.resetPasswordEmailOTP({
      body: {
        email: payload.email,
        otp: payload.otp,
        password: payload.password,
      },
    });
  },
};
