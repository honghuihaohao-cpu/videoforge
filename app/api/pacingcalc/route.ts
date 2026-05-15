import { NextResponse } from "next/server";
import { calculatePacing } from "@/lib/pacingcalc";

export async function POST(req: Request) {
  try {
    const { script, platform } = await req.json();
    if (!script?.trim()) return NextResponse.json({ error: "请粘贴脚本" }, { status: 400 });
    const result = await calculatePacing(script, platform || "bilibili");
    return NextResponse.json(result);
  } catch (e: any) {
    const msg = e?.message || "计算失败";
    if (msg.includes("API Key")) return NextResponse.json({ error: "API Key 未配置" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
