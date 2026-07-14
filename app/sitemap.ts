import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl();
  const paths = [
    "",
    "/formations",
    "/categories",
    "/tarifs",
    "/comment-ca-marche",
    "/faq",
    "/a-propos",
    "/contact",
    "/conditions-utilisation",
    "/politique-confidentialite",
  ];

  return paths.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
