import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeData } from "@/lib/ai-analyzer";

const bodySchema = z.object({
  projectId: z.string().min(1),
  views: z.number().optional(),
  likes: z.number().optional(),
  comments: z.number().optional(),
  shares: z.number().optional(),
  favorites: z.number().optional(),
  retentionData: z.string().optional(),
  audienceData: z.string().optional(),
  sourceData: z.string().optional(),
  platform: z.string().optional(),
  apiKey: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "参数校验失败", details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await analyzeData({
      views: parsed.data.views || 0,
      likes: parsed.data.likes || 0,
      comments: parsed.data.comments || 0,
      shares: parsed.data.shares || 0,
      favorites: parsed.data.favorites || 0,
      retentionData: parsed.data.retentionData,
      audienceData: parsed.data.audienceData,
      sourceData: parsed.data.sourceData,
      platform: parsed.data.platform || "bilibili",
    }, parsed.data.apiKey);

    return NextResponse.json(result);
  } catch (error: any) {
    const msg = error?.message || "分析失败";
    if (msg.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: "API Key 未配置" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
