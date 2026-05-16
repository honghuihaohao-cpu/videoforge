import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock entire Anthropic SDK
const mockCreate = vi.fn().mockResolvedValue({
  content: [{ type: "text", text: `【综合评分】85/100

【详细分析】
钩子力度：9/10 - 开场画面感强
信息节奏：8/10 - 第2段稍显平淡
金句密度：7/10 - 有3句可截图传播
口语化程度：9/10 - 自然流畅

【优先改进项】
1. [节奏] 第2段可以压缩到原来的一半
2. [钩子] 第一句建议加上具体数字
3. [结构] 结尾的开放问题可以更尖锐

【一句话总结】
内容扎实，改两个小地方就能上线。` }],
});

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages: any;
    constructor(opts: any) {
      this.messages = { create: mockCreate };
    }
  },
}));

import { isApiKeyConfigured, analyzeScript } from "../ai-analyzer";

describe("ai-analyzer", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...OLD_ENV };
  });

  describe("isApiKeyConfigured", () => {
    it("returns false when key is placeholder", () => {
      process.env.ANTHROPIC_API_KEY = "your-api-key-here";
      expect(isApiKeyConfigured()).toBe(false);
    });

    it("returns false when key is not set", () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(isApiKeyConfigured()).toBe(false);
    });

    it("returns true when key is set", () => {
      process.env.ANTHROPIC_API_KEY = "sk-ant-real-key";
      expect(isApiKeyConfigured()).toBe(true);
    });
  });

  describe("analyzeScript", () => {
    it("returns structured analysis result", async () => {
      process.env.ANTHROPIC_API_KEY = "sk-ant-real-key";
      const result = await analyzeScript("测试脚本内容", "选题验证", "测试prompt");
      expect(result.score).toBe(85);
      expect(result.content).toContain("综合评分");
      expect(result.suggestions).toHaveLength(3);
      expect(result.suggestions[0].category).toBe("节奏");
      expect(result.suggestions[0].priority).toBe(1);
    });
  });
});
