import Anthropic from "@anthropic-ai/sdk";

export interface DiagnosticResult {
  overallScore: number;
  pace: { rating: number; issues: string[] };
  logic: { rating: number; gaps: string[] };
  density: { rating: number; overloadZones: string[] };
  hooks: { rating: number; suggestions: string[] };
  topFixes: { priority: number; location: string; problem: string; fix: string }[];
}

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") throw new Error("ANTHROPIC_API_KEY 未配置");
  return new Anthropic({ apiKey });
}

export async function diagnoseScript(script: string): Promise<DiagnosticResult> {
  const client = getClient();

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: "你是视频脚本诊断专家。用工程化的视角评估脚本质量。重点找观众会在哪里走神。用中文。输出JSON。",
    messages: [{
      role: "user",
      content: `诊断以下脚本（最多分析前6000字）：

${script.slice(0, 6000)}

输出JSON：
{
  "overallScore": 75,
  "pace": {"rating": 7, "issues": ["节奏问题描述"]},
  "logic": {"rating": 8, "gaps": ["逻辑漏洞"]},
  "density": {"rating": 6, "overloadZones": ["信息过载区域，如'第5-8分钟'"]},
  "hooks": {"rating": 9, "suggestions": ["钩子优化建议"]},
  "topFixes": [
    {"priority": 1, "location": "开头3秒", "problem": "问题", "fix": "建议修改方案"}
  ]
}`,
    }],
  });

  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return {
    overallScore: 70,
    pace: { rating: 7, issues: [] },
    logic: { rating: 7, gaps: [] },
    density: { rating: 7, overloadZones: [] },
    hooks: { rating: 7, suggestions: [] },
    topFixes: [],
  };
}
