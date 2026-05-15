import { NextResponse } from "next/server";
import { generateSEO } from "@/lib/seodesc";

export async function POST(req: Request) {
  try {
    const { title, summary, platform } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "请输入视频标题" }, { status: 400 });
    const result = await generateSEO(title, summary || "", platform || "bilibili");
    return NextResponse.json(result);
  } catch (e: any) {
    const msg = e?.message || "生成失败";
    if (msg.includes("API Key")) return NextResponse.json({ error: "API Key 未配置" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
