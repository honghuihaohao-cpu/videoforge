import Anthropic from "@anthropic-ai/sdk";

export interface CommentReport {
  videoTitle: string;
  totalComments: number;
  analyzedAt: string;
  topics: { label: string; percentage: number; count: number }[];
  requests: string[];
  goldenQuotes: { quote: string; count: number }[];
  sentiment: { positive: number; neutral: number; negative: number };
  nextTopics: { title: string; expectedScore: number; reason: string }[];
  summary: string;
}

// B站 API: fetch comments
export async function fetchBilibiliComments(oid: string, page = 1): Promise<{ total: number; comments: string[] }> {
  const url = `https://api.bilibili.com/x/v2/reply?type=1&oid=${oid}&pn=${page}&ps=20&sort=2`;
  const res = await fetch(url, { headers: { "User-Agent": "CommentMine/1.0", Referer: "https://www.bilibili.com/" } });
  const json = await res.json();
  if (json.code !== 0) throw new Error("获取评论失败：" + json.message);
  const replies = json.data?.replies || [];
  return {
    total: json.data?.page?.count || replies.length,
    comments: replies.map((r: any) => r.content?.message || "").filter(Boolean),
  };
}

// Get video info (title, aid)
export async function fetchBilibiliVideoInfo(bvid: string): Promise<{ title: string; aid: number }> {
  const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
  const res = await fetch(url, { headers: { "User-Agent": "CommentMine/1.0", Referer: "https://www.bilibili.com/" } });
  const json = await res.json();
  if (json.code !== 0) throw new Error("视频不存在：" + json.message);
  return { title: json.data.title, aid: json.data.aid };
}

export function extractBvid(input: string): string | null {
  const match = input.match(/BV[A-Za-z0-9]+/);
  return match ? match[0] : null;
}

// AI analysis
export async function analyzeComments(
  comments: string[],
  videoTitle: string
): Promise<CommentReport> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "your-api-key-here") throw new Error("ANTHROPIC_API_KEY 未配置");

  const client = new Anthropic({ apiKey });
  const commentsText = comments.join("\n---\n");

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: `你是 CommentMine AI，专做B站评论区分析。从评论中提取洞见，输出结构化JSON。用中文。`,
    messages: [{
      role: "user",
      content: `分析以下B站视频《${videoTitle}》的评论（共${comments.length}条）：

${commentsText}

输出JSON格式：
{
  "topics": [{"label": "话题名", "percentage": 41, "count": 82}],
  "requests": ["用户主动提出的选题请求"],
  "goldenQuotes": [{"quote": "评论中反复引用的传播金句", "count": 引用次数}],
  "sentiment": {"positive": 60, "neutral": 30, "negative": 10},
  "nextTopics": [{"title": "下期选题建议", "expectedScore": 85, "reason": "理由"}],
  "summary": "一句话总结评论区的核心反馈"
}`,
    }],
  });

  const text = msg.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        videoTitle,
        totalComments: comments.length,
        analyzedAt: new Date().toISOString(),
        topics: data.topics || [],
        requests: data.requests || [],
        goldenQuotes: data.goldenQuotes || [],
        sentiment: data.sentiment || { positive: 0, neutral: 0, negative: 0 },
        nextTopics: data.nextTopics || [],
        summary: data.summary || "分析完成",
      };
    }
  } catch { /* fall through */ }

  return {
    videoTitle,
    totalComments: comments.length,
    analyzedAt: new Date().toISOString(),
    topics: [],
    requests: [],
    goldenQuotes: [],
    sentiment: { positive: 0, neutral: 0, negative: 0 },
    nextTopics: [],
    summary: text.slice(0, 200),
  };
}
