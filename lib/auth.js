import { SignJWT, jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/constants";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const SESSION_MAX_AGE = 60 * 30; // 30 minutes in seconds

export async function createSession(templateId, module, recordId) {
  const token = await new SignJWT({ templateId, module, recordId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(JWT_SECRET);

  return { token, maxAge: SESSION_MAX_AGE };
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE, SESSION_MAX_AGE };
