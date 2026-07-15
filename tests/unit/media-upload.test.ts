import { describe, expect, it } from "vitest";
import { assertValidImageFile, getImageFileFromFormData } from "@/lib/storage/media";

describe("media upload validation", () => {
  it("accepte un JPEG valide", () => {
    const file = new File([new Uint8Array([1, 2, 3])], "cover.jpg", {
      type: "image/jpeg",
    });
    expect(() => assertValidImageFile(file)).not.toThrow();
  });

  it("refuse un type non image", () => {
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    expect(() => assertValidImageFile(file)).toThrow(/Format image/);
  });

  it("refuse un fichier trop lourd", () => {
    const big = new File([new Uint8Array(6 * 1024 * 1024)], "big.jpg", {
      type: "image/jpeg",
    });
    expect(() => assertValidImageFile(big)).toThrow(/trop lourde/);
  });

  it("extrait le fichier depuis FormData", () => {
    const fd = new FormData();
    fd.set(
      "imageFile",
      new File([new Uint8Array([1])], "a.png", { type: "image/png" }),
    );
    expect(getImageFileFromFormData(fd)?.name).toBe("a.png");
    expect(getImageFileFromFormData(new FormData())).toBeNull();
  });
});
