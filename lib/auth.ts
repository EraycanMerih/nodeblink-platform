import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NODEBLINK_ENC_KEY ?? process.env.JWT_SECRET ?? "default_development_secret_key_change_in_prod",
);

const ALG = "HS256";
export const COOKIE_NAME = "nodeblink_auth_token";

export interface AuthSession {
  walletAddress: string;
  iat?: number;
  exp?: number;
}

export async function createSession(walletAddress: string) {
  const token = await new SignJWT({ walletAddress })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

export async function verifySession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthSession;
  } catch (error) {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
