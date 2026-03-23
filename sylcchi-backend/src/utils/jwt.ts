import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { envVars } from "../config/env";

type JwtUserPayload = {
  sub: string;
  email: string;
  role: string;
  emailVerified: boolean;
  tokenVersion: number;
};

type JwtTokens = {
  accessToken: string;
  refreshToken: string;
};

type RefreshPayload = JwtPayload & {
  sub: string;
  tokenVersion: number;
};

function signToken(payload: object, expiresIn: string): string {
  return jwt.sign(payload, envVars.JWT_SECRET, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
}

export function generateAuthTokens(user: JwtUserPayload): JwtTokens {
  const accessToken = signToken(
    {
      sub: user.sub,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      type: "access",
    },
    envVars.ACCESS_TOKEN_EXPIRES_IN,
  );

  const refreshToken = signToken(
    {
      sub: user.sub,
      tokenVersion: user.tokenVersion,
      type: "refresh",
    },
    envVars.REFRESH_TOKEN_EXPIRES_IN,
  );

  return { accessToken, refreshToken };
}

export function verifyRefreshToken(token: string): RefreshPayload {
  const decoded = jwt.verify(token, envVars.JWT_SECRET);

  if (!decoded || typeof decoded === "string") {
    throw new Error("Invalid refresh token");
  }

  if (decoded.type !== "refresh") {
    throw new Error("Invalid token type");
  }

  if (typeof decoded.sub !== "string") {
    throw new Error("Invalid token subject");
  }

  if (typeof decoded.tokenVersion !== "number") {
    throw new Error("Invalid token version");
  }

  return decoded as RefreshPayload;
}
