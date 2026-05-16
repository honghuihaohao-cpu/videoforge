import { describe, it, expect, vi } from "vitest";

// Mock Anthropic
const mockCreate = vi.fn().mockResolvedValue({
  content: [{ type: "text", text: `{"result":"ok"}` }],
});

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages: any;
    constructor() { this.messages = { create: mockCreate }; }
  },
}));

// Test that all tool libs export expected functions
import { extractBvid } from "../comment-miner";
import { analyzeContent, reforgeContent, extractBvid as reforgeExtractBvid } from "../reforge";
import { extractConcepts, buildGraph, queryForTopic } from "../knowledge-chain";

describe("comment-miner exports", () => {
  it("exports extractBvid", () => {
    expect(typeof extractBvid).toBe("function");
  });
  it("extractBvid works on valid BV", () => {
    expect(extractBvid("BV1234567890")).toBe("BV1234567890");
  });
  it("extractBvid returns null on garbage", () => {
    expect(extractBvid("not a url")).toBeNull();
  });
});

describe("reforge exports", () => {
  it("exports analyzeContent", () => {
    expect(typeof analyzeContent).toBe("function");
  });
  it("exports reforgeContent", () => {
    expect(typeof reforgeContent).toBe("function");
  });
  it("extracts BV from URL", () => {
    expect(reforgeExtractBvid("https://bilibili.com/video/BV123")).toBe("BV123");
  });
  it("returns null for invalid input", () => {
    expect(reforgeExtractBvid("")).toBeNull();
  });
});

describe("knowledge-chain exports", () => {
  it("exports extractConcepts", () => {
    expect(typeof extractConcepts).toBe("function");
  });
  it("exports buildGraph", () => {
    expect(typeof buildGraph).toBe("function");
  });
  it("exports queryForTopic", () => {
    expect(typeof queryForTopic).toBe("function");
  });
});
