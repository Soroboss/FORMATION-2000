import { describe, expect, it } from "vitest";
import {
  extractYouTubeVideoId,
  isValidYouTubeVideoId,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from "@/lib/youtube/url";
import { canWatchLesson } from "@/lib/subscriptions/access";

describe("YouTube URL parsing", () => {
  it("accepte un identifiant brut valide", () => {
    expect(extractYouTubeVideoId("PkZNo7MFNFg")).toBe("PkZNo7MFNFg");
    expect(isValidYouTubeVideoId("PkZNo7MFNFg")).toBe(true);
  });

  it("extrait les formats d'URL courants", () => {
    expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=PkZNo7MFNFg")).toBe(
      "PkZNo7MFNFg",
    );
    expect(extractYouTubeVideoId("https://youtu.be/PkZNo7MFNFg")).toBe("PkZNo7MFNFg");
    expect(extractYouTubeVideoId("https://www.youtube.com/embed/PkZNo7MFNFg")).toBe(
      "PkZNo7MFNFg",
    );
    expect(extractYouTubeVideoId("https://www.youtube.com/shorts/PkZNo7MFNFg")).toBe(
      "PkZNo7MFNFg",
    );
  });

  it("rejette les domaines ou identifiants invalides", () => {
    expect(extractYouTubeVideoId("https://evil.com/watch?v=PkZNo7MFNFg")).toBeNull();
    expect(extractYouTubeVideoId("not-a-valid-id")).toBeNull();
    expect(isValidYouTubeVideoId("short")).toBe(false);
  });

  it("construit les URLs officielles", () => {
    expect(youtubeWatchUrl("PkZNo7MFNFg")).toBe(
      "https://www.youtube.com/watch?v=PkZNo7MFNFg",
    );
    expect(youtubeEmbedUrl("PkZNo7MFNFg", 12)).toContain("youtube-nocookie.com/embed/PkZNo7MFNFg");
    expect(youtubeEmbedUrl("PkZNo7MFNFg", 12)).toContain("start=12");
  });
});

describe("lesson access", () => {
  it("autorise les aperçus et le contenu gratuit", () => {
    expect(
      canWatchLesson({
        isPreview: true,
        courseAccessType: "subscription",
        hasPremiumAccess: false,
      }),
    ).toBe(true);
    expect(
      canWatchLesson({
        isPreview: false,
        courseAccessType: "free",
        hasPremiumAccess: false,
      }),
    ).toBe(true);
  });

  it("verrouille le premium sans abonnement", () => {
    expect(
      canWatchLesson({
        isPreview: false,
        courseAccessType: "subscription",
        hasPremiumAccess: false,
      }),
    ).toBe(false);
    expect(
      canWatchLesson({
        isPreview: false,
        courseAccessType: "subscription",
        hasPremiumAccess: true,
      }),
    ).toBe(true);
  });
});
