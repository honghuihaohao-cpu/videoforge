import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeCovers } from "@/lib/cover-judge";

const schema = z.object({
  images: z.array(z.object({ base64: z.string(), filename: z.string() })).min(2).max(4),
  platform: z.enum(["bilibili", "douyin", "wechat"]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "参数校验失败" }, { status: 400 });
    const results = await analyzeCovers(parsed.data.images, parsed.data.platform);
    return NextResponse.json(results);
  } catch (e: any) {
    const msg = e?.message || "分析失败";
    if (msg.includes("API Key")) return NextResponse.json({ error: "API Key 未配置" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
