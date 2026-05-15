import Anthropic from "@anthropic-ai/sdk";

export interface ContentAnalysis {
  title: string;
  coreThesis: string;
  segments: { start: string; end: string; type: "hook" | "argument" | "example" | "transition" | "climax"; summary: string }[];
  goldenQuotes: string[];
  keyData: string[];
}

export interface PlatformOutputs {
  douyin: string[];        // 3-5 short video scripts
  wechat: string;          // markdown article
  xiaohongshu: string[];  // image-text posts
  shipinhao: string;      // medium-length + share text
  twitter: string[];      // thread
}

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") throw new Error("ANTHROPIC_API_KEY 未配置");
  return new Anthropic({ apiKey });
}

export async function analyzeContent(script: string, title?: string): Promise<ContentAnalysis> {
  const client = getClient();
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: "你是内容分析专家。分析视频脚本，提取结构化信息。输出JSON。用中文。",
    messages: [{
      role: "user",
      content: `分析以下视频脚本${title ? `《${title}》` : ""}：

${script.slice(0, 8000)}

输出JSON：
{
  "title": "视频标题",
  "coreThesis": "核心论点（一句话）",
  "segments": [{"start": "0:00", "end": "2:00", "type": "hook", "summary": "内容概述"}],
  "goldenQuotes": ["金句1"],
  "keyData": ["关键数据1"]
}`,
    }],
  });

  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}

  return { title: title || "未命名", coreThesis: text.slice(0, 200), segments: [], goldenQuotes: [], keyData: [] };
}

export async function reforgeContent(script: string, title: string): Promise<PlatformOutputs> {
  const client = getClient();
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system: "你是多平台内容改编专家。将长视频脚本改编为不同平台的格式。每个平台有独特的风格要求。输出JSON。用中文。",
    messages: [{
      role: "user",
      content: `将以下视频脚本《${title}》改编为5个平台的格式：

${script.slice(0, 6000)}

输出JSON：
{
  "douyin": ["拆条1: 标题 + 3分钟脚本（快节奏竖屏风格，悬念式结尾）", "拆条2", "拆条3"],
  "wechat": "公众号文章（markdown格式，有标题、导语、小标题、段落、金句加粗。2000字左右）",
  "xiaohongshu": ["图文帖1: 核心观点+emoji+话题标签", "图文帖2"],
  "shipinhao": "视频号版本（5-8分钟中长度脚本 + 朋友圈转发引导文案）",
  "twitter": ["线程推文1", "线程推文2", "线程推文3"]
}`,
    }],
  });

  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}

  return { douyin: [], wechat: "# 内容生成失败\n请重试", xiaohongshu: [], shipinhao: "", twitter: [] };
}

// B站 subtitle fetch
export async function fetchBilibiliSubtitle(bvid: string): Promise<string> {
  const infoUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
  const infoRes = await fetch(infoUrl, { headers: { "User-Agent": "Reforge/1.0", Referer: "https://www.bilibili.com/" } });
  const infoJson = await infoRes.json();
  if (infoJson.code !== 0) throw new Error("视频不存在");

  const cid = infoJson.data.cid;
  const subUrl = `https://api.bilibili.com/x/player/v2?bvid=${bvid}&cid=${cid}`;
  const subRes = await fetch(subUrl, { headers: { "User-Agent": "Reforge/1.0", Referer: "https://www.bilibili.com/" } });
  const subJson = await subRes.json();

  const subtitles = subJson.data?.subtitle?.subtitles;
  if (subtitles?.length) {
    const subContent = await fetch(subtitles[0].subtitle_url);
    const subText = await subContent.text();
    const lines = subText.split("\n").filter(Boolean);
    return lines.map((l) => {
      const parts = l.split(",");
      return parts.length >= 3 ? parts.slice(2).join(",") : l;
    }).join("\n");
  }

  return infoJson.data.desc || "";
}

export function extractBvid(input: string): string | null {
  const match = input.match(/BV[A-Za-z0-9]+/);
  return match ? match[0] : null;
}
