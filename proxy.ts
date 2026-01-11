import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/types";

const sessionOptions = {
  password:
    process.env.SESSION_SECRET ??
    "complex_password_at_least_32_characters_long_for_demo",
  cookieName: "resource-allocation-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
  },
};

async function getSession(req: NextRequest, res: NextResponse) {
  return getIronSession<SessionData>(req, res, sessionOptions);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/login", "/_next", "/api/auth/login"];
  if (
    publicRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.includes("static") ||
    pathname.includes("favicon")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getSession(request, response);

  if (!session.isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.role;

  if (pathname.startsWith("/hr") && !["HR", "Leadership"].includes(role)) {
    return NextResponse.redirect(
      new URL(`/${role.toLowerCase()}`, request.url)
    );
  }

  if (pathname.startsWith("/executive") && role !== "Leadership") {
    return NextResponse.redirect(
      new URL(`/${role.toLowerCase()}`, request.url)
    );
  }

  if (pathname.startsWith("/pm") && !["PM", "Leadership"].includes(role)) {
    return NextResponse.redirect(
      new URL(`/${role.toLowerCase()}`, request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
