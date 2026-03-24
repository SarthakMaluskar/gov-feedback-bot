import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

const protectedRoutes = [
  "/",
  "/offices",
  "/reports",
  "/escalations",
  "/feedback",
  "/governance",
  "/office-registry",
];

const publicRoutes = [
  "/login",
  "/forgot-password",
  "/auth/login",
  "/auth/accept-invite",
  "/auth/forgot-password",
];

function isExactOrSubpath(path: string, route: string): boolean {
  if (route === "/") return path === "/";
  return path === route || path.startsWith(`${route}/`);
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => isExactOrSubpath(path, route));
  const isPublicRoute = publicRoutes.some((route) => isExactOrSubpath(path, route));

  const token = request.cookies.get("auth-token")?.value;

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const response = NextResponse.next();
    response.headers.set("x-user-id", payload.userId);
    response.headers.set("x-user-role", payload.role);
    return response;
  }

  if (isPublicRoute && token) {
    const payload = await verifyToken(token);
    if (payload) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.png$).*)",
  ],
};
