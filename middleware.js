import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "./lib/constants";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function getValidSession(token, templateId, module, recordId) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Ensure the session belongs to this exact record
    if (
      payload.templateId === templateId &&
      payload.module === module &&
      payload.recordId === recordId
    ) {
      return payload;
    }
    return null;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  const isPortalPage = segments.length === 3;
  const isLoginPage = segments.length === 4 && segments[3] === "login";

  if (!isPortalPage && !isLoginPage) {
    return NextResponse.next();
  }

  const [templateId, module, recordId] = segments;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await getValidSession(token, templateId, module, recordId) : null;

  // Portal page: must have a valid session
  if (isPortalPage && !session) {
    return NextResponse.redirect(new URL(`${pathname}/login`, request.url));
  }

  // Login page: redirect away if already authenticated
  if (isLoginPage && session) {
    const portalPath = `/${segments.slice(0, 3).join("/")}`;
    return NextResponse.redirect(new URL(portalPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
