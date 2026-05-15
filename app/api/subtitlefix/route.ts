import { NextResponse } from "next/server";
import { fixSubtitles } from "@/lib/subtitlefix";

export async function POST(req: Request) {
  try {
    const { subtitles } = await req.json();
    if (!subtitles?.trim()) return NextResponse.json({ error: "请粘贴字幕文本" }, { status: 400 });
    const result = await fixSubtitles(subtitles);
    return NextResponse.json(result);
  } catch (e: any) {
    const msg = e?.message || "修正失败";
    if (msg.includes("API Key")) return NextResponse.json({ error: "API Key 未配置" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
