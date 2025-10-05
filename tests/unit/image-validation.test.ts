import { describe, it, expect } from "vitest";
import {
  validateImageFile,
  imageToBase64,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/utils/image-validation";

describe("Image Validation Utils", () => {
  describe("validateImageFile", () => {
    it("should accept valid JPEG image", () => {
      const file = new File(["dummy content"], "test.jpg", {
        type: "image/jpeg",
      });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept valid PNG image", () => {
      const file = new File(["dummy content"], "test.png", {
        type: "image/png",
      });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should accept valid WebP image", () => {
      const file = new File(["dummy content"], "test.webp", {
        type: "image/webp",
      });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject non-image files", () => {
      const file = new File(["dummy content"], "test.pdf", {
        type: "application/pdf",
      });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("File must be an image");
    });

    it("should reject unsupported image types", () => {
      const file = new File(["dummy content"], "test.bmp", {
        type: "image/bmp",
      });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("is not supported");
    });

    it("should reject files exceeding size limit", () => {
      const largeContent = new Array(MAX_IMAGE_SIZE + 1).fill("x").join("");
      const file = new File([largeContent], "large.jpg", {
        type: "image/jpeg",
      });
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds maximum allowed size");
    });

    it("should accept files at size limit", () => {
      const content = new Array(MAX_IMAGE_SIZE - 100).fill("x").join("");
      const file = new File([content], "large.jpg", { type: "image/jpeg" });
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
    });
  });

  describe("imageToBase64", () => {
    it("should convert file to base64", async () => {
      const content = "test content";
      const file = new File([content], "test.jpg", { type: "image/jpeg" });

      const result = await imageToBase64(file);

      expect(result).toContain("data:image/jpeg;base64,");
      expect(typeof result).toBe("string");
    });

    it("should handle different image types", async () => {
      const file = new File(["content"], "test.png", { type: "image/png" });

      const result = await imageToBase64(file);

      expect(result).toContain("data:image/png;base64,");
    });
  });

  describe("Constants", () => {
    it("should have correct MAX_IMAGE_SIZE", () => {
      expect(MAX_IMAGE_SIZE).toBe(5 * 1024 * 1024); // 5MB
    });

    it("should have correct ALLOWED_IMAGE_TYPES", () => {
      expect(ALLOWED_IMAGE_TYPES).toContain("image/jpeg");
      expect(ALLOWED_IMAGE_TYPES).toContain("image/jpg");
      expect(ALLOWED_IMAGE_TYPES).toContain("image/png");
      expect(ALLOWED_IMAGE_TYPES).toContain("image/webp");
      expect(ALLOWED_IMAGE_TYPES).toContain("image/gif");
      expect(ALLOWED_IMAGE_TYPES).toHaveLength(5);
    });
  });
});
