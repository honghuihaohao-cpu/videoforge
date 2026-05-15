import Anthropic from "@anthropic-ai/sdk";

export interface TrendResult {
  trends: { topic: string; heat: number; competition: string; fit: string; angle: string }[];
  summary: string;
}

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") throw new Error("ANTHROPIC_API_KEY 未配置");
  return new Anthropic({ apiKey });
}

export async function spotTrends(
  platform: string,
  niche: string
): Promise<TrendResult> {
  const client = getClient();

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: `你是${platform === "bilibili" ? "B站" : platform === "douyin" ? "抖音" : "视频号"}内容趋势分析师。基于你的知识（截至2026年初），推荐当前值得追的热点方向和选题角度。用中文。输出JSON。`,
    messages: [{
      role: "user",
      content: `基于你的训练知识，推荐${platform === "bilibili" ? "B站" : platform === "douyin" ? "抖音" : "视频号"}${niche ? `在「${niche}」领域` : ""}当前（2026年上半年）值得追的5个内容趋势/选题方向。

输出JSON：
{
  "trends": [
    {
      "topic": "趋势/选题名称",
      "heat": 85,
      "competition": "高/中/低",
      "fit": "是否适合你的频道定位",
      "angle": "推荐的独特切入角度"
    }
  ],
  "summary": "一句话总结当前内容风向"
}`,
    }],
  });

  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return { trends: [], summary: "分析失败，请重试" };
}
