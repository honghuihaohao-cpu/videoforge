import { NextResponse } from "next/server";
import { diagnoseScript } from "@/lib/scriptdoctor";

export async function POST(req: Request) {
  try {
    const { script } = await req.json();
    if (!script || script.length < 50) return NextResponse.json({ error: "脚本至少50字" }, { status: 400 });
    const result = await diagnoseScript(script);
    return NextResponse.json(result);
  } catch (e: any) {
    const msg = e?.message || "诊断失败";
    if (msg.includes("API Key")) return NextResponse.json({ error: "API Key 未配置" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
