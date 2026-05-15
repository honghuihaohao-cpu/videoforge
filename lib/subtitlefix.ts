import Anthropic from "@anthropic-ai/sdk";

export interface SubtitleResult {
  corrected: string;
  changes: { original: string; corrected: string; type: string }[];
  stats: { typos: number; breaks: number; terms: number };
}

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") throw new Error("ANTHROPIC_API_KEY 未配置");
  return new Anthropic({ apiKey });
}

export async function fixSubtitles(subtitles: string): Promise<SubtitleResult> {
  const client = getClient();

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: "你是字幕校对专家。修正错别字、优化断句、纠正专业术语。输出JSON。用中文。",
    messages: [{
      role: "user",
      content: `修正以下字幕文本（保持原意和口语风格，只修改明显错误）：

${subtitles.slice(0, 4000)}

输出JSON：
{
  "corrected": "修正后的完整文本",
  "changes": [
    {"original": "原文本片段", "corrected": "修正后", "type": "typo|break|term"}
  ],
  "stats": {"typos": 错别字数, "breaks": 断句优化数, "terms": 术语修正数}
}`,
    }],
  });

  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return { corrected: subtitles, changes: [], stats: { typos: 0, breaks: 0, terms: 0 } };
}
