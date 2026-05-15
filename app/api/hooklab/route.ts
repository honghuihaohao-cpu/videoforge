import { NextResponse } from "next/server";
import { generateHooks } from "@/lib/hooklab";

export async function POST(req: Request) {
  try {
    const { topic, audience, platform } = await req.json();
    if (!topic) return NextResponse.json({ error: "请输入视频主题" }, { status: 400 });
    const result = await generateHooks(topic, audience || "泛人群", platform || "bilibili");
    return NextResponse.json(result);
  } catch (e: any) {
    const msg = e?.message || "生成失败";
    if (msg.includes("API Key")) return NextResponse.json({ error: "API Key 未配置" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
