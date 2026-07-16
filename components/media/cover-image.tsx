import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  canOptimizeImageUrl,
  COVER_IMAGE_SIZES,
  type CoverImageVariant,
} from "@/lib/media/cover-image";

const ASPECT_CLASS: Record<CoverImageVariant, string> = {
  card: "aspect-[16/9]",
  hero: "aspect-[21/9] sm:aspect-[3/1]",
  banner: "aspect-[21/9] min-h-[12rem] sm:min-h-[16rem]",
  // `fill`/`thumb` : la hauteur est contrôlée par le parent.
  fill: "h-full w-full",
  thumb: "h-full w-full",
};

type CoverImageOverlay = "none" | "bottom" | "hero";

type CoverImageProps = {
  src: string;
  alt: string;
  variant?: CoverImageVariant;
  priority?: boolean;
  overlay?: CoverImageOverlay;
  className?: string;
  imageClassName?: string;
};

const OVERLAY_CLASS: Record<CoverImageOverlay, string | null> = {
  none: null,
  bottom:
    "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent",
  hero: "pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20",
};

/**
 * Image de couverture optimisée (next/image) avec repli natif pour URLs externes inconnues.
 */
export function CoverImage({
  src,
  alt,
  variant = "card",
  priority = false,
  overlay = "none",
  className,
  imageClassName,
}: CoverImageProps) {
  const aspect = ASPECT_CLASS[variant];
  const overlayClass = OVERLAY_CLASS[overlay];
  const optimizable = canOptimizeImageUrl(src);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-action-600",
        aspect,
        className,
      )}
    >
      {optimizable ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={COVER_IMAGE_SIZES[variant]}
          priority={priority}
          className={cn("object-cover object-center", imageClassName)}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-center",
            imageClassName,
          )}
        />
      )}
      {overlayClass ? <div className={overlayClass} aria-hidden /> : null}
    </div>
  );
}
