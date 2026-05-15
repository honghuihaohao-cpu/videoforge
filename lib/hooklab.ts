import Anthropic from "@anthropic-ai/sdk";

export interface HookResult {
  hooks: { style: string; hook: string; predictedRetention: number; bestAudience: string }[];
}

const STYLES = ["提问式", "数据冲击", "故事开场", "争议反转", "幽默共鸣"];

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") throw new Error("ANTHROPIC_API_KEY 未配置");
  return new Anthropic({ apiKey });
}

export async function generateHooks(
  topic: string,
  audience: string,
  platform: string
): Promise<HookResult> {
  const client = getClient();

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: `你是短视频钩子专家。为${platform === "bilibili" ? "B站" : platform === "douyin" ? "抖音" : "视频号"}创作者生成5种不同风格的开场钩子。目标受众：${audience}。每种风格都是独立的，观众在前3秒做出"继续看"或"划走"的决定。用中文。输出JSON。`,
    messages: [{
      role: "user",
      content: `主题：${topic.slice(0, 500)}
平台：${platform}
受众：${audience}

生成5种风格的钩子：
${STYLES.map((s) => `- ${s}`).join("\n")}

输出JSON：
{
  "hooks": [
    {"style": "提问式", "hook": "钩子文案（15-30字）", "predictedRetention": 75, "bestAudience": "最适合这个钩子的人群"}
  ]
}`,
    }],
  });

  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return { hooks: [] };
}
