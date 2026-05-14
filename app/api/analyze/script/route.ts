import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeScript } from "@/lib/ai-analyzer";

const bodySchema = z.object({
  content: z.string().min(1, "content 不能为空"),
  stepName: z.string().optional(),
  prompt: z.string().min(1, "prompt 不能为空"),
  apiKey: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "参数校验失败", details: parsed.error.flatten() }, { status: 400 });
    }

    const { content, stepName, prompt, apiKey } = parsed.data;
    const result = await analyzeScript(content, stepName || "未知", prompt, apiKey);
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
