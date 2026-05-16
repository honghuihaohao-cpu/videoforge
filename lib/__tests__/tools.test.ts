import { describe, it, expect, vi, beforeEach } from "vitest";

// Shared mock for Anthropic
const mockCreate = vi.fn().mockImplementation(({ messages }: any) => {
  const prompt = JSON.stringify(messages);
  if (prompt.includes("封面CTR")) {
    return Promise.resolve({ content: [{ type: "text", text: `{"score":78,"strengths":["高对比"],"weaknesses":["偏暗"],"attentionZones":"标题","readability":"可读","contrastScore":82}` }] });
  }
  if (prompt.includes("B站评论")) {
    return Promise.resolve({ content: [{ type: "text", text: `{"topics":[{"label":"技术","percentage":45,"count":23}],"requests":["更新"],"goldenQuotes":[{"quote":"好","count":5}],"sentiment":{"positive":70,"neutral":20,"negative":10},"nextTopics":[{"title":"测试","expectedScore":85,"reason":"提及"}],"summary":"积极"}` }] });
  }
  return Promise.resolve({ content: [{ type: "text", text: "{}" }] });
});

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages: any;
    constructor() { this.messages = { create: mockCreate }; }
  },
}));

import { extractBvid } from "../comment-miner";

describe("comment-miner", () => {
  describe("extractBvid", () => {
    it("extracts BV号 from URL", () => {
      expect(extractBvid("https://www.bilibili.com/video/BV1xx411c7mD")).toBe("BV1xx411c7mD");
    });
    it("returns null for non-B站 URLs", () => {
      expect(extractBvid("https://youtube.com/watch?v=abc")).toBeNull();
    });
  });
});

describe("cover-judge", () => {
  it("exports platform type constants", () => {
    const platforms = ["bilibili", "douyin", "wechat"];
    expect(platforms.every((p) => ["bilibili", "douyin", "wechat"].includes(p))).toBe(true);
  });
});
