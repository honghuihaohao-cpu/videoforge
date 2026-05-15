import Anthropic from "@anthropic-ai/sdk";

export interface Concept {
  name: string;
  category: "core" | "supporting" | "example";
  relatedTo: string[];
}

export interface ContentItem {
  id: string;
  title: string;
  source: string;
  concepts: string[];
  summary: string;
  addedAt: string;
}

export interface KnowledgeGraph {
  items: ContentItem[];
  concepts: Concept[];
  themes: string[];
  blindSpots: string[];
}

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") throw new Error("ANTHROPIC_API_KEY 未配置");
  return new Anthropic({ apiKey });
}

export async function extractConcepts(content: string, title?: string): Promise<{ concepts: string[]; summary: string }> {
  const client = getClient();
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: "你是知识管理专家。从内容中提取核心概念。输出JSON。用中文。",
    messages: [{
      role: "user",
      content: `从以下内容${title ? `《${title}》` : ""}中提取信息：

${content.slice(0, 4000)}

输出JSON：{"concepts": ["概念1", "概念2", "概念3"], "summary": "一段话概述核心内容"}`,
    }],
  });

  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return { concepts: [], summary: text.slice(0, 200) };
}

export async function buildGraph(items: ContentItem[]): Promise<{ concepts: Concept[]; themes: string[]; blindSpots: string[] }> {
  if (items.length === 0) return { concepts: [], themes: [], blindSpots: [] };

  const client = getClient();
  const allConcepts = [...new Set(items.flatMap((i) => i.concepts))];
  const summaries = items.map((i) => `-《${i.title}》: ${i.summary}`).join("\n");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: "你是知识图谱专家。分析内容集合，发现概念关联。输出JSON。用中文。",
    messages: [{
      role: "user",
      content: `分析以下知识库：

概念列表：${allConcepts.join(", ")}
内容摘要：
${summaries}

输出JSON：
{
  "concepts": [{"name": "概念名", "category": "core|supporting|example", "relatedTo": ["关联概念"]}],
  "themes": ["你反复讨论的主题"],
  "blindSpots": ["你明显遗漏的子话题"]
}`,
    }],
  });

  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return { concepts: [], themes: [], blindSpots: [] };
}

export async function queryForTopic(
  items: ContentItem[],
  query: string
): Promise<{ relevantItems: string[]; angle: string; suggestedTitle: string }> {
  const client = getClient();
  const summaries = items.map((i, idx) => `[${idx}]《${i.title}》: ${i.summary} (概念: ${i.concepts.join(", ")})`).join("\n");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: "你是选题顾问。根据知识库推荐相关素材。输出JSON。用中文。",
    messages: [{
      role: "user",
      content: `我想做「${query}」这个选题。我的知识库：
${summaries}

输出JSON：
{
  "relevantItems": ["匹配的条目编号 [0], [2] 等"],
  "angle": "基于你已有内容的独特切入角度",
  "suggestedTitle": "建议的文章/视频标题"
}`,
    }],
  });

  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch {}
  return { relevantItems: [], angle: text.slice(0, 200), suggestedTitle: query };
}
