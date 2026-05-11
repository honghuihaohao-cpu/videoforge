import { NextResponse } from "next/server";
import { analyzeScript } from "@/lib/ai-analyzer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, stepName, prompt, apiKey } = body;

    if (!content || !prompt) {
      return NextResponse.json({ error: "缺少 content 或 prompt 参数" }, { status: 400 });
    }

    // Allow key override for testing
    if (apiKey) {
      process.env.ANTHROPIC_API_KEY = apiKey;
    }

    const result = await analyzeScript(content, stepName || "未知", prompt);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API analyze error:", error);
    const msg = error?.message || "分析失败";
    if (msg.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: "API Key 未配置。请在 .env 文件中设置 ANTHROPIC_API_KEY。" }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
