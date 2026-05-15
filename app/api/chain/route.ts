import { NextResponse } from "next/server";
import { extractConcepts, buildGraph, queryForTopic } from "@/lib/knowledge-chain";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { action, content, title, query } = await req.json();

    if (action === "add" && content) {
      const { concepts, summary } = await extractConcepts(content, title);
      const item = await db.knowChainItem.create({
        data: {
          title: title || "未命名",
          content: content.slice(0, 10000),
          concepts: JSON.stringify(concepts),
          summary,
        },
      });
      return NextResponse.json({
        item: { ...item, concepts },
        totalItems: await db.knowChainItem.count(),
      });
    }

    if (action === "graph") {
      const items = await db.knowChainItem.findMany({ orderBy: { addedAt: "desc" } });
      if (!items.length) return NextResponse.json({ error: "请先添加内容" }, { status: 400 });

      const parsedItems = items.map((i) => ({
        id: i.id,
        title: i.title,
        source: "kb",
        concepts: (() => { try { return JSON.parse(i.concepts); } catch { return []; } })(),
        summary: i.summary,
        addedAt: i.addedAt.toISOString(),
      }));

      const { concepts, themes, blindSpots } = await buildGraph(parsedItems);
      return NextResponse.json({ items: parsedItems, concepts, themes, blindSpots });
    }

    if (action === "query" && query) {
      const items = await db.knowChainItem.findMany({ orderBy: { addedAt: "desc" } });
      if (!items.length) return NextResponse.json({ error: "请先添加内容" }, { status: 400 });

      const parsedItems = items.map((i) => ({
        id: i.id,
        title: i.title,
        source: "kb",
        concepts: (() => { try { return JSON.parse(i.concepts); } catch { return []; } })(),
        summary: i.summary,
        addedAt: i.addedAt.toISOString(),
      }));

      const result = await queryForTopic(parsedItems, query);
      const matchedItems = result.relevantItems
        .map((r) => { const idx = parseInt(r.match(/\d+/)?.[0] || "xx"); return !isNaN(idx) && idx < parsedItems.length ? parsedItems[idx] : null; })
        .filter(Boolean);
      return NextResponse.json({ ...result, items: matchedItems });
    }

    return NextResponse.json({ error: "无效操作" }, { status: 400 });
  } catch (e: any) {
    const msg = e?.message || "操作失败";
    if (msg.includes("API Key")) return NextResponse.json({ error: "API Key 未配置" }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
