import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export interface AnalysisResult {
  score: number;
  content: string;
  suggestions: { priority: number; category: string; suggestion: string }[];
}

type AIProvider = "claude" | "openai" | "deepseek";

function getProviderConfig(): { provider: AIProvider; apiKey: string; model: string; baseURL?: string } {
  const provider = (process.env.AI_PROVIDER || "claude") as AIProvider;
  let apiKey: string;
  let model: string;
  let baseURL: string | undefined;

  switch (provider) {
    case "openai":
      apiKey = process.env.OPENAI_API_KEY || "";
      model = process.env.OPENAI_MODEL || "gpt-4o";
      break;
    case "deepseek":
      apiKey = process.env.DEEPSEEK_API_KEY || "";
      model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
      baseURL = "https://api.deepseek.com";
      break;
    default:
      apiKey = process.env.ANTHROPIC_API_KEY || "";
      model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  }

  if (!apiKey || apiKey === "your-api-key-here") {
    throw new Error(
      `AI API Key 未配置。请在 .env 中设置 ${provider === "claude" ? "ANTHROPIC_API_KEY" : provider === "openai" ? "OPENAI_API_KEY" : "DEEPSEEK_API_KEY"}。`
    );
  }

  return { provider, apiKey, model, baseURL };
}

export function isApiKeyConfigured(): boolean {
  try {
    getProviderConfig();
    return true;
  } catch {
    return false;
  }
}

async function callAI(systemPrompt: string, userPrompt: string, apiKeyOverride?: string): Promise<string> {
  const config = getProviderConfig();
  const apiKey = apiKeyOverride || config.apiKey;

  if (config.provider === "claude") {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: config.model,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user" as const, content: userPrompt }],
    });
    return msg.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  }

  // OpenAI-compatible API (works for DeepSeek too)
  const client = new OpenAI({ apiKey, baseURL: config.baseURL || undefined });
  const completion = await client.chat.completions.create({
    model: config.model,
    max_tokens: 2048,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  return completion.choices[0]?.message?.content || "";
}

export async function analyzeScript(
  scriptContent: string,
  stepName: string,
  customPrompt: string,
  apiKeyOverride?: string
): Promise<AnalysisResult> {
  const systemPrompt = `你是 VideoForge AI，一个专为知识科普视频创作者服务的 AI 评审系统。
你的风格：直接、具体、有建设性。不给泛泛的"这里可以更好"，而是指出"具体哪一段的什么问题，怎么改"。
你的分析必须包含一个 0-100 的综合评分，以及按优先级排序的改进建议。
用中文回复。`;

  const userPrompt = `${customPrompt}

【用户提交的脚本/内容】
---
${scriptContent}
---

请按以下格式回复：
【综合评分】X/100

【详细分析】
（分维度分析，每项带评分）

【优先改进项】
1. [类别] 具体建议
2. [类别] 具体建议
3. [类别] 具体建议

【一句话总结】
（给创作者的一句鼓励或提醒）`;

  const text = await callAI(systemPrompt, userPrompt, apiKeyOverride);
  return parseAiResponse(text);
}

export async function analyzeData(
  videoData: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    favorites: number;
    retentionData?: string;
    audienceData?: string;
    sourceData?: string;
    platform: string;
  },
  apiKeyOverride?: string
): Promise<AnalysisResult> {
  const systemPrompt = `你是 VideoForge AI 的数据复盘分析师。你的任务是分析视频数据，找出问题，给出具体改进建议。用中文回复。`;

  const userPrompt = `分析以下视频的数据表现，平台：${videoData.platform}

基础数据：
- 播放量：${videoData.views}
- 点赞：${videoData.likes}（点赞率：${videoData.views > 0 ? ((videoData.likes / videoData.views) * 100).toFixed(2) : 0}%）
- 评论：${videoData.comments}
- 分享：${videoData.shares}
- 收藏：${videoData.favorites}（收藏率：${videoData.views > 0 ? ((videoData.favorites / videoData.views) * 100).toFixed(2) : 0}%）

留存数据：${videoData.retentionData || "未提供"}
观众画像：${videoData.audienceData || "未提供"}
流量来源：${videoData.sourceData || "未提供"}

请按以下格式回复：

【综合评分】X/100

【关键发现】
- 留存曲线分析（如果有留存数据）
- 互动质量评估（点赞率/收藏率是否健康）
- 观众画像与内容的匹配度

【优先改进项】
1. [类别] 具体建议
2. [类别] 具体建议
3. [类别] 具体建议

【下期实验建议】
一个值得在下一期尝试的A/B测试方案`;

  const text = await callAI(systemPrompt, userPrompt, apiKeyOverride);
  return parseAiResponse(text);
}

function parseAiResponse(text: string): AnalysisResult {
  const scoreMatch = text.match(/【综合评分】\s*(\d+)/);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;

  const suggestions: AnalysisResult["suggestions"] = [];
  const suggestionRegex = /\d+\.\s*\[([^\]]+)\]\s*(.+)/g;
  let match;
  let priority = 1;
  while ((match = suggestionRegex.exec(text)) !== null) {
    suggestions.push({
      priority: priority++,
      category: match[1].trim(),
      suggestion: match[2].trim(),
    });
  }

  return { score, content: text, suggestions };
}
