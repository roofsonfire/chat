import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("Utils", () => {
  describe("cn (className merger)", () => {
    it("should merge class names", () => {
      const result = cn("class1", "class2");
      expect(result).toContain("class1");
      expect(result).toContain("class2");
    });

    it("should handle conditional classes", () => {
      const result = cn("base", false && "conditional", "always");
      expect(result).toContain("base");
      expect(result).toContain("always");
      expect(result).not.toContain("conditional");
    });

    it("should merge Tailwind classes correctly", () => {
      const result = cn("px-2", "px-4");
      // Should keep only px-4 due to tailwind-merge
      expect(result).toBe("px-4");
    });

    it("should handle undefined and null", () => {
      const result = cn("class1", undefined, null, "class2");
      expect(result).toContain("class1");
      expect(result).toContain("class2");
    });

    it("should handle arrays", () => {
      const result = cn(["class1", "class2"]);
      expect(result).toContain("class1");
      expect(result).toContain("class2");
    });

    it("should handle objects", () => {
      const result = cn({
        class1: true,
        class2: false,
        class3: true,
      });
      expect(result).toContain("class1");
      expect(result).toContain("class3");
      expect(result).not.toContain("class2");
    });
  });
});
