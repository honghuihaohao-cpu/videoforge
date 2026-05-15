import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeContent, reforgeContent } from "@/lib/reforge";

export async function POST(req: Request) {
  try {
    const { input, type, title } = await req.json();
    const script = type === "url" ? (input || "").slice(0, 8000) : input;
    if (!script || script.length < 50) return NextResponse.json({ error: "内容太短" }, { status: 400 });

    const [analysis, outputs] = await Promise.all([
      analyzeContent(script, title),
      reforgeContent(script, title || "未命名"),
    ]);
    return NextResponse.json({ analysis, outputs, title: title || "未命名", wordCount: script.length });
  } catch (e: any) {
    const msg = e?.message || "处理失败";
    if (msg.includes("API Key")) return NextResponse.json({ error: "API Key 未配置" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
