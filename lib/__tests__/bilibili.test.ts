import { describe, it, expect } from "vitest";
import { extractBilibiliVideoId } from "../platform/bilibili";

describe("bilibili", () => {
  describe("extractBilibiliVideoId", () => {
    it("extracts BV号 from URL", () => {
      expect(extractBilibiliVideoId("https://www.bilibili.com/video/BV1xx411c7mD")).toBe("BV1xx411c7mD");
    });

    it("extracts BV号 from bare BV format", () => {
      expect(extractBilibiliVideoId("BV1xx411c7mD")).toBe("BV1xx411c7mD");
    });

    it("extracts av号", () => {
      expect(extractBilibiliVideoId("av12345678")).toBe("av12345678");
    });

    it("handles full URL with query params", () => {
      expect(extractBilibiliVideoId("https://www.bilibili.com/video/BV123?p=1&t=60")).toBe("BV123");
    });

    it("returns null for non-B站 input", () => {
      expect(extractBilibiliVideoId("https://youtube.com/watch?v=abc")).toBeNull();
      expect(extractBilibiliVideoId("random text")).toBeNull();
      expect(extractBilibiliVideoId("")).toBeNull();
    });

    it("handles short URL format", () => {
      expect(extractBilibiliVideoId("https://b23.tv/BV123")).toBe("BV123");
    });
  });
});
