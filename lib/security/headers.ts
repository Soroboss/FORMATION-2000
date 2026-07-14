/**
 * Security headers & CSP for Learnoon Academy.
 * CSP must allow official YouTube embeds (youtube-nocookie / youtube.com).
 */

export function buildContentSecurityPolicy(input?: {
  appUrl?: string;
  insforgeUrl?: string;
}): string {
  const appOrigin = input?.appUrl
    ? (() => {
        try {
          return new URL(input.appUrl).origin;
        } catch {
          return "'self'";
        }
      })()
    : "'self'";

  let insforgeOrigin = "";
  if (input?.insforgeUrl) {
    try {
      insforgeOrigin = new URL(input.insforgeUrl).origin;
    } catch {
      insforgeOrigin = "";
    }
  }

  const connectSrc = [
    "'self'",
    appOrigin !== "'self'" ? appOrigin : null,
    insforgeOrigin || null,
    "https://*.insforge.app",
    "https://vitals.vercel-insights.com",
    "https://va.vercel-scripts.com",
  ]
    .filter(Boolean)
    .join(" ");

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com https://*.insforge.app https://vercel.live",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
    // Next.js + Analytics require inline/eval in practice for App Router chunks.
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com https://va.vercel-scripts.com https://vercel.live",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://vercel.live",
    `connect-src ${connectSrc}`,
    "media-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
    "upgrade-insecure-requests",
  ];

  return directives.join("; ");
}

export function securityHeaders(input?: {
  appUrl?: string;
  insforgeUrl?: string;
}): { key: string; value: string }[] {
  return [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(input),
    },
  ];
}
