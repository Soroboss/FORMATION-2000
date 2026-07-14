import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import {
  ACCESS_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  REFRESH_COOKIE,
} from "@/lib/auth/cookies";
import { getAppUrl, safeInternalPath } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const start = Date.now();
  const params = request.nextUrl.searchParams;
  const code = params.get("insforge_code");
  const error = params.get("error");
  const next = safeInternalPath(params.get("next"));

  if (error || !code) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "oauth_callback_failed",
        route: "/api/auth/callback",
        error: error ?? "missing_code",
        ms: Date.now() - start,
      }),
    );
    return NextResponse.redirect(new URL(`/connexion?error=${error ?? "oauth_failed"}`, getAppUrl()));
  }

  const cookieStore = await cookies();
  const codeVerifier = cookieStore.get(OAUTH_VERIFIER_COOKIE)?.value;

  if (!codeVerifier) {
    return NextResponse.redirect(new URL("/connexion?error=missing_verifier", getAppUrl()));
  }

  try {
    const client = createInsForgeServerClient();
    const { data, error: exchangeError } = await client.auth.exchangeOAuthCode(
      code,
      codeVerifier,
    );

    if (exchangeError || !data?.accessToken) {
      console.error(
        JSON.stringify({
          level: "error",
          msg: "oauth_exchange_failed",
          route: "/api/auth/callback",
          error: exchangeError?.message ?? "exchange_failed",
          ms: Date.now() - start,
        }),
      );
      return NextResponse.redirect(new URL("/connexion?error=exchange_failed", getAppUrl()));
    }

    const response = NextResponse.redirect(new URL(next, getAppUrl()));
    response.cookies.set(ACCESS_COOKIE, data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
    if (data.refreshToken) {
      response.cookies.set(REFRESH_COOKIE, data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    response.cookies.delete(OAUTH_VERIFIER_COOKIE);

    console.log(
      JSON.stringify({
        level: "info",
        msg: "oauth_callback_ok",
        route: "/api/auth/callback",
        ms: Date.now() - start,
      }),
    );

    return response;
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "oauth_callback_exception",
        route: "/api/auth/callback",
        error: err instanceof Error ? err.message : String(err),
        ms: Date.now() - start,
      }),
    );
    return NextResponse.redirect(new URL("/connexion?error=oauth_failed", getAppUrl()));
  }
}
