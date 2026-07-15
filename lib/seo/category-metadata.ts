import type { Metadata } from "next";
import type { Category } from "@/types/catalog";
import { getAppName, getAppUrl } from "@/lib/utils";

export function buildCategoryMetadata(
  category: Category,
  options?: { pathPrefix?: string },
): Metadata {
  const prefix = options?.pathPrefix ?? "/categories";
  const appName = getAppName();
  const url = `${getAppUrl()}${prefix}/${category.slug}`;
  const description =
    category.description ??
    `Formations ${category.name} sur ${appName} — parcours structurés, vidéos et accès premium.`;

  return {
    title: category.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url,
      siteName: appName,
      title: category.name,
      description,
      ...(category.imageUrl
        ? {
            images: [
              {
                url: category.imageUrl,
                alt: category.name,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: category.imageUrl ? "summary_large_image" : "summary",
      title: category.name,
      description,
      ...(category.imageUrl ? { images: [category.imageUrl] } : {}),
    },
  };
}

export function buildCategoryJsonLd(
  category: Category,
  courseCount: number,
  options?: { pathPrefix?: string },
) {
  const prefix = options?.pathPrefix ?? "/categories";
  const url = `${getAppUrl()}${prefix}/${category.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description ?? undefined,
    url,
    ...(category.imageUrl ? { image: category.imageUrl } : {}),
    numberOfItems: courseCount,
    isPartOf: {
      "@type": "WebSite",
      name: getAppName(),
      url: getAppUrl(),
    },
  };
}
