import Anthropic from "@anthropic-ai/sdk";

export interface TitleResult {
  titles: { text: string; predictedCTR: number; reason: string }[];
  tips: string;
}

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") throw new Error("ANTHROPIC_API_KEY 未配置");
  return new Anthropic({ apiKey });
}

export async function generateTitles(
  description: string,
  platform: string
): Promise<TitleResult> {
  const client = getClient();

  const platformGuidelines: Record<string, string> = {
    bilibili: "B站标题：制造好奇心缺口，用反直觉的事实或问题开头。长度15-25字。喜欢用「一个」「为什么」「到底」等词制造悬念。",
    douyin: "抖音标题：情绪化、口语化、短（10-15字）。用「竟然」「真的」「绝了」等情绪词。直接说结果不要铺垫。",
    wechat: "视频号标题：专业感和社交货币感。2-8字。适合转发到朋友圈的调性。克制、有观点。",
  };

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: `你是视频标题专家，专门为${platform === "bilibili" ? "B站" : platform === "douyin" ? "抖音" : "视频号"}创作者生成高点击率标题。${platformGuidelines[platform] || ""}用中文。输出JSON。`,
    messages: [{
      role: "user",
      content: `为以下视频内容生成5个${platform === "bilibili" ? "B站" : platform === "douyin" ? "抖音" : "视频号"}标题：

视频描述：${description.slice(0, 2000)}

输出JSON：
{
  "titles": [
    {"text": "标题文本", "predictedCTR": 85, "reason": "为什么这个标题点击率高"}
  ],
  "tips": "给创作者的标题优化建议（一句话）"
}`,
    }],
  });

  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return { titles: [], tips: "生成失败，请重试" };
}
