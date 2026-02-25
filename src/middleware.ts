import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  name: string;
}

// Decode JWT payload without verification (safe for routing only).
// Actual security is enforced in API route handlers via jsonwebtoken.
function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(payload));
    // Check expiry
    if (decoded.exp && decoded.exp * 1000 < Date.now()) return null;
    return decoded as JWTPayload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ["/login", "/register"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // API routes that don't need auth
  const publicApiRoutes = ["/api/auth/login", "/api/auth/register"];
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname.startsWith(route));

  // Allow public routes and static files
  if (isPublicRoute || isPublicApiRoute || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  // Redirect root to login if not authenticated
  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const payload = decodeToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Redirect to role-based dashboard
    switch (payload.role) {
      case "TEAM_LEADER":
        return NextResponse.redirect(new URL("/dashboard", request.url));
      case "COORDINATOR":
        return NextResponse.redirect(new URL("/coordinator", request.url));
      case "SUPER_ADMIN":
        return NextResponse.redirect(new URL("/admin", request.url));
      default:
        return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Check authentication for protected routes
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = decodeToken(token);
  if (!payload) {
    const response = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Invalid token" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  // Role-based route protection
  if (pathname.startsWith("/dashboard") && payload.role !== "TEAM_LEADER") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname.startsWith("/coordinator") && payload.role !== "COORDINATOR") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname.startsWith("/admin") && payload.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // API route role protection
  if (pathname.startsWith("/api/admin") && payload.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Add user info to headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", String(payload.userId));
  requestHeaders.set("x-user-role", payload.role);
  requestHeaders.set("x-user-email", payload.email);
  requestHeaders.set("x-user-name", payload.name);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
