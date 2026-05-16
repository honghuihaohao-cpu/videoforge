import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("utils", () => {
  describe("cn", () => {
    it("merges tailwind classes", () => {
      expect(cn("px-4", "py-2")).toBe("px-4 py-2");
    });

    it("handles conditional classes", () => {
      expect(cn("base", false && "hidden", "block")).toBe("base block");
    });

    it("resolves conflicting tailwind classes", () => {
      expect(cn("px-2", "px-4")).toBe("px-4");
    });

    it("returns empty string for no args", () => {
      expect(cn()).toBe("");
    });

    it("handles undefined/null gracefully", () => {
      expect(cn("base", undefined, null, "extra")).toBe("base extra");
    });
  });
});
