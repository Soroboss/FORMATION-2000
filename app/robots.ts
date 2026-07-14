import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  const base = getAppUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/formations", "/categories", "/tarifs", "/faq", "/a-propos", "/contact"],
        disallow: ["/app/", "/admin/", "/api/", "/paiement/sandbox"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
