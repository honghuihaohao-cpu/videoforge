import { NextResponse } from "next/server";
import { extractConcepts, buildGraph, queryForTopic } from "@/lib/knowledge-chain";
import type { ContentItem } from "@/lib/knowledge-chain";

let store: ContentItem[] = [];

export async function POST(req: Request) {
  try {
    const { action, content, title, query } = await req.json();

    if (action === "add" && content) {
      const { concepts, summary } = await extractConcepts(content, title);
      const item: ContentItem = {
        id: Date.now().toString(36), title: title || "未命名", source: "manual",
        concepts, summary, addedAt: new Date().toISOString(),
      };
      store.push(item);
      return NextResponse.json({ item, totalItems: store.length });
    }

    if (action === "graph") {
      if (!store.length) return NextResponse.json({ error: "请先添加内容" }, { status: 400 });
      const { concepts, themes, blindSpots } = await buildGraph(store);
      return NextResponse.json({ items: store, concepts, themes, blindSpots });
    }

    if (action === "query" && query) {
      if (!store.length) return NextResponse.json({ error: "请先添加内容" }, { status: 400 });
      const result = await queryForTopic(store, query);
      const items = result.relevantItems
        .map((r) => { const idx = parseInt(r.match(/\d+/)?.[0] || ""); return !isNaN(idx) && idx < store.length ? store[idx] : null; })
        .filter(Boolean);
      return NextResponse.json({ ...result, items });
    }

    return NextResponse.json({ error: "无效操作" }, { status: 400 });
  } catch (e: any) {
    const msg = e?.message || "操作失败";
    if (msg.includes("API Key")) return NextResponse.json({ error: "API Key 未配置" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
