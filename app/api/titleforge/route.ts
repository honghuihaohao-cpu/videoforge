import { NextResponse } from "next/server";
import { generateTitles } from "@/lib/title-forge";

export async function POST(req: Request) {
  try {
    const { description, platform } = await req.json();
    if (!description) return NextResponse.json({ error: "请输入视频内容描述" }, { status: 400 });
    const result = await generateTitles(description, platform || "bilibili");
    return NextResponse.json(result);
  } catch (e: any) {
    const msg = e?.message || "生成失败";
    if (msg.includes("API Key")) return NextResponse.json({ error: "API Key 未配置" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
