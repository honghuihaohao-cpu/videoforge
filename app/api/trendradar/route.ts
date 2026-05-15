import { NextResponse } from "next/server";
import { spotTrends } from "@/lib/trendradar";

export async function POST(req: Request) {
  try {
    const { platform, niche } = await req.json();
    const result = await spotTrends(platform || "bilibili", niche || "");
    return NextResponse.json(result);
  } catch (e: any) {
    const msg = e?.message || "分析失败";
    if (msg.includes("API Key")) return NextResponse.json({ error: "API Key 未配置" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
