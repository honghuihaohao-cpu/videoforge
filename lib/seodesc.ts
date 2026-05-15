import Anthropic from "@anthropic-ai/sdk";

export interface SEOResult {
  description: string;
  tags: string[];
  hashtags: string[];
}

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") throw new Error("ANTHROPIC_API_KEY 未配置");
  return new Anthropic({ apiKey });
}

export async function generateSEO(
  title: string,
  summary: string,
  platform: string
): Promise<SEOResult> {
  const client = getClient();
  const platformName = platform === "bilibili" ? "B站" : platform === "douyin" ? "抖音" : "视频号";

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `你是${platformName}视频SEO专家。生成高搜索量的视频简介和标签。用中文。输出JSON。`,
    messages: [{
      role: "user",
      content: `视频标题：${title.slice(0, 200)}
内容概述：${summary.slice(0, 500)}

为${platformName}生成：
输出JSON：
{
  "description": "视频简介（150-300字，含关键词）",
  "tags": ["标签1", "标签2", ... 8-12个标签],
  "hashtags": ["#话题1", "#话题2", ... 3-5个话题]
}`,
    }],
  });

  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try { const m = text.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch {}
  return { description: summary, tags: [], hashtags: [] };
}
