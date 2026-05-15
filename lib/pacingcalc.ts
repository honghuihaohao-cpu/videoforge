import Anthropic from "@anthropic-ai/sdk";

export interface PacingResult {
  wordCount: number;
  estimatedDuration: { min: number; max: number; optimal: number };
  pacing: { label: string; score: number; tip: string }[];
  suggestions: string[];
}

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") throw new Error("ANTHROPIC_API_KEY 未配置");
  return new Anthropic({ apiKey });
}

export async function calculatePacing(script: string, platform: string): Promise<PacingResult> {
  // Local calculation first
  const chars = script.replace(/\s/g, "").length;
  const wordsPerMinute = platform === "douyin" ? 280 : platform === "bilibili" ? 220 : 250;
  const optimalMinutes = Math.round(chars / wordsPerMinute);
  const minMinutes = Math.round(chars / (wordsPerMinute + 40));
  const maxMinutes = Math.round(chars / (wordsPerMinute - 40));

  const client = getClient();
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: "你是视频节奏分析专家。用中文。输出JSON。",
    messages: [{
      role: "user",
      content: `分析这段${platform === "bilibili" ? "B站" : platform === "douyin" ? "抖音" : "视频号"}脚本的节奏（${chars}字）：

${script.slice(0, 3000)}

输出JSON：
{
  "pacing": [
    {"label": "节奏维度", "score": 8, "tip": "优化建议"}
  ],
  "suggestions": ["整体改进建议"]
}`,
    }],
  });

  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  let ai: any = { pacing: [], suggestions: [] };
  try { const m = text.match(/\{[\s\S]*\}/); if (m) ai = JSON.parse(m[0]); } catch {}

  return {
    wordCount: chars,
    estimatedDuration: { min: minMinutes, max: maxMinutes, optimal: optimalMinutes },
    pacing: ai.pacing || [],
    suggestions: ai.suggestions || [],
  };
}
