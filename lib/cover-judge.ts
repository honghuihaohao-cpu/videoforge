import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export interface CoverResult {
  filename: string;
  scores: Record<Platform, number>;
  strengths: string[];
  weaknesses: string[];
  attentionZones: string;
  readability: string;
  overallCTR: number;
}

export type Platform = "bilibili" | "douyin" | "wechat";

const PLATFORM_CRITERIA: Record<Platform, string> = {
  bilibili: "B站封面偏好：大字标题（对比度高）在左上角或居中；背景干净不杂乱；文字可读性优先于一切；有明确的视觉焦点而非多个焦点。",
  douyin: "抖音封面偏好：人脸+强情绪表情冲击力最大；竖屏构图；画面留白少但信息集中；颜色对比度极高（红/黄/蓝 vs 深色背景）。",
  wechat: "视频号封面偏好：专业感和可信度优先；适合在朋友圈展示（不过于娱乐化）；文字克制（2-4字）；方形构图友好。",
};

function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
  if (!key || key === "your-api-key-here") throw new Error("API Key 未配置");
  return key;
}

export async function analyzeCover(
  imageBase64: string,
  filename: string,
  platform: Platform
): Promise<{ score: number; strengths: string[]; weaknesses: string[]; attentionZones: string; readability: string; contrastScore: number }> {
  const key = getApiKey();
  const client = new Anthropic({ apiKey: key });

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `你是封面CTR预测专家，专门分析视频封面在不同平台上的点击率潜力。${PLATFORM_CRITERIA[platform]}
评估时模拟真实用户在推荐流中0.3秒扫过封面的注意力分配。忽略你的美学偏好，只关注"会不会点"。
用中文回复，必须输出JSON格式。`,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/png", data: imageBase64 },
          },
          {
            type: "text",
            text: `分析这张封面在${platform === "bilibili" ? "B站" : platform === "douyin" ? "抖音" : "视频号"}推荐流中的CTR潜力，输出JSON：

{
  "score": <0-100的CTR预测分>,
  "strengths": ["优点1", "优点2", "优点3"],
  "weaknesses": ["缺点1", "缺点2"],
  "attentionZones": "0.3秒内注意力首先被什么区域吸引",
  "readability": "手机上缩略图大小的文字可读性判断",
  "contrastScore": <0-100的对比度评分（暗黑模式下可见度）>
}`,
          },
        ],
      },
    ],
  });

  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch { /* fall through */ }

  // Fallback: parse from text
  const scoreMatch = text.match(/score[:\s]*(\d+)/i);
  return {
    score: scoreMatch ? parseInt(scoreMatch[1]) : 50,
    strengths: [],
    weaknesses: [],
    attentionZones: "无法解析",
    readability: "无法解析",
    contrastScore: 50,
  } as any;
}

export async function analyzeCovers(
  images: { base64: string; filename: string }[],
  platform: Platform
): Promise<CoverResult[]> {
  const results: CoverResult[] = [];

  for (const img of images) {
    const scores = await analyzeCover(img.base64, img.filename, platform);

    // Also get scores for other platforms (lighter evaluation)
    const otherPlatforms: Platform[] = ["bilibili", "douyin", "wechat"].filter((p) => p !== platform) as Platform[];
    const otherScores: Record<string, any> = {};

    for (const op of otherPlatforms) {
      try {
        const os = await analyzeCover(img.base64, img.filename, op as Platform);
        otherScores[op] = os.score;
      } catch {
        otherScores[op] = scores.score - 5;
      }
    }

    const allScores = {
      [platform]: scores.score,
      ...otherScores,
    } as Record<Platform, number>;

    results.push({
      filename: img.filename,
      scores: allScores,
      strengths: scores.strengths || [],
      weaknesses: scores.weaknesses || [],
      attentionZones: scores.attentionZones || "",
      readability: scores.readability || "",
      overallCTR: Math.round(Object.values(allScores).reduce((a, b) => a + b, 0) / 3),
    });
  }

  return results.sort((a, b) => b.overallCTR - a.overallCTR);
}
