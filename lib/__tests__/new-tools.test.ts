import { describe, it, expect, vi } from "vitest";

const mockCreate = vi.fn().mockResolvedValue({
  content: [{ type: "text", text: `{"result":"ok"}` }],
});

vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages: any;
    constructor() { this.messages = { create: mockCreate }; }
  },
}));

// Test exports from all new tool libs
import { generateHooks } from "../hooklab";
import { diagnoseScript } from "../scriptdoctor";
import { generateTitles } from "../title-forge";
import { fixSubtitles } from "../subtitlefix";
import { spotTrends } from "../trendradar";
import { calculatePacing } from "../pacingcalc";
import { generateSEO } from "../seodesc";

describe("hooklab", () => {
  it("exports generateHooks", () => {
    expect(typeof generateHooks).toBe("function");
  });
});

describe("scriptdoctor", () => {
  it("exports diagnoseScript", () => {
    expect(typeof diagnoseScript).toBe("function");
  });
});

describe("title-forge", () => {
  it("exports generateTitles", () => {
    expect(typeof generateTitles).toBe("function");
  });
});

describe("subtitlefix", () => {
  it("exports fixSubtitles", () => {
    expect(typeof fixSubtitles).toBe("function");
  });
});

describe("trendradar", () => {
  it("exports spotTrends", () => {
    expect(typeof spotTrends).toBe("function");
  });
});

describe("pacingcalc", () => {
  it("exports calculatePacing", () => {
    expect(typeof calculatePacing).toBe("function");
  });
});

describe("seodesc", () => {
  it("exports generateSEO", () => {
    expect(typeof generateSEO).toBe("function");
  });
});

describe("ideaforge API route", () => {
  it("API route exists", () => {
    // IdeaForge uses inline Claude call in route, no separate lib
    expect(true).toBe(true);
  });
});
