import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

const ACCESS_COOKIE = "insforge_access_token";
const REFRESH_COOKIE = "insforge_refresh_token";

function hasSessionCookies(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get(ACCESS_COOKIE)?.value ||
      request.cookies.get(REFRESH_COOKIE)?.value,
  );
}

function clientKey(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function withRequestId(response: NextResponse, requestId: string) {
  response.headers.set("x-request-id", requestId);
  return response;
}

function rateLimitedJson(requestId: string) {
  const res = NextResponse.json(
    {
      error: {
        code: "RATE_LIMITED",
        message: "Trop de requêtes. Réessayez plus tard.",
      },
    },
    { status: 429 },
  );
  res.headers.set("Retry-After", "60");
  return withRequestId(res, requestId);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const ip = clientKey(request);

  const isAuthPage =
    pathname === "/connexion" ||
    pathname === "/inscription" ||
    pathname === "/mot-de-passe-oublie" ||
    pathname === "/verifier-email";
  const isSensitiveApi =
    pathname.startsWith("/api/payments") ||
    pathname.startsWith("/api/webhooks/payments") ||
    pathname.startsWith("/api/auth");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isProgressApi = pathname.startsWith("/api/progress");
  const isCronApi = pathname.startsWith("/api/cron");
  const isProtectedApi = isAdminApi || isProgressApi;

  if (isAuthPage || isSensitiveApi || isProtectedApi || isCronApi) {
    const shouldLimit =
      isSensitiveApi || isProtectedApi || isCronApi || request.method !== "GET";
    if (shouldLimit) {
      const limit = isCronApi ? 20 : isSensitiveApi || isProtectedApi ? 60 : 30;
      const result = checkRateLimit({
        key: `${pathname}:${request.method}:${ip}`,
        limit,
        windowMs: 60_000,
      });
      if (!result.allowed) {
        if (isSensitiveApi || isProtectedApi || isCronApi) {
          return rateLimitedJson(requestId);
        }
        const res = new NextResponse("Trop de requêtes. Réessayez dans une minute.", {
          status: 429,
          headers: { "Retry-After": "60", "Content-Type": "text/plain; charset=utf-8" },
        });
        return withRequestId(res, requestId);
      }
    }
  }

  if (isProtectedApi && !hasSessionCookies(request)) {
    return withRequestId(
      NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Connexion requise." } },
        { status: 401 },
      ),
      requestId,
    );
  }

  const isProtected =
    pathname.startsWith("/app") || pathname.startsWith("/admin");

  if (isProtected && !hasSessionCookies(request)) {
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("next", pathname);
    return withRequestId(NextResponse.redirect(loginUrl), requestId);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  return withRequestId(response, requestId);
}

export const config = {
  matcher: [
    "/app/:path*",
    "/admin/:path*",
    "/connexion",
    "/inscription",
    "/mot-de-passe-oublie",
    "/verifier-email",
    "/api/payments/:path*",
    "/api/webhooks/payments/:path*",
    "/api/auth/:path*",
    "/api/admin/:path*",
    "/api/progress/:path*",
    "/api/cron/:path*",
  ],
};
