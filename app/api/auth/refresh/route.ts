import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createInsForgeServerClient } from "@/lib/insforge/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";

export async function POST() {
  const start = Date.now();
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: { code: "NO_REFRESH", message: "No refresh token" } }, { status: 401 });
  }

  try {
    const client = createInsForgeServerClient();
    const { data, error } = await client.auth.refreshSession({ refreshToken });

    if (error || !data?.accessToken) {
      console.error(
        JSON.stringify({
          level: "error",
          msg: "refresh_failed",
          route: "/api/auth/refresh",
          error: error?.message ?? "refresh_failed",
          ms: Date.now() - start,
        }),
      );
      const response = NextResponse.json(
        { error: { code: "REFRESH_FAILED", message: "Unable to refresh session" } },
        { status: 401 },
      );
      response.cookies.delete(ACCESS_COOKIE);
      response.cookies.delete(REFRESH_COOKIE);
      return response;
    }

    const response = NextResponse.json({ ok: true });
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

    console.log(
      JSON.stringify({
        level: "info",
        msg: "refresh_ok",
        route: "/api/auth/refresh",
        ms: Date.now() - start,
      }),
    );

    return response;
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "refresh_exception",
        route: "/api/auth/refresh",
        error: err instanceof Error ? err.message : String(err),
        ms: Date.now() - start,
      }),
    );
    return NextResponse.json(
      { error: { code: "REFRESH_EXCEPTION", message: "Unable to refresh session" } },
      { status: 500 },
    );
  }
}
