"use client";

import { useState } from "react";
import { Plus, Loader2, Network, Search, AlertCircle, BookOpen, Lightbulb, EyeOff, Tag } from "lucide-react";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function KnowChainPage() {
  const [tab, setTab] = useState<"add" | "graph" | "query">("add");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [itemCount, setItemCount] = useState(0);
  const [error, setError] = useState("");

  async function call(action: string, body: any) {
    setLoading(true); setError(""); setResult(null);
    const r = await fetch("/api/chain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...body }) });
    const d = await r.json();
    if (d.error) setError(d.error); else setResult(d);
    setLoading(false);
    return d;
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">KnowChain</h1><p className="text-muted-foreground">导入内容 → 提取概念 → 构建图谱 → 选题推荐</p></div><span className="text-sm text-muted-foreground">{itemCount} 条</span></div>

      <div className="flex gap-1">{(["add", "graph", "query"] as const).map((t) => (
        <button key={t} onClick={() => { setTab(t); setResult(null); }} className={`px-3 py-1.5 rounded-lg text-sm ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{t === "add" ? <><Plus className="h-3 w-3 inline mr-1" />添加</> : t === "graph" ? <><Network className="h-3 w-3 inline mr-1" />图谱</> : <><Search className="h-3 w-3 inline mr-1" />选题</>}</button>
      ))}</div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</div>}

      {tab === "add" && (
        <div className="rounded-xl border p-4 space-y-3">
          <input type="text" placeholder="标题（可选）" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-10 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea placeholder="粘贴文章/脚本/笔记..." value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
          <button onClick={async () => { const d = await call("add", { content: content.trim(), title: title.trim() || undefined }); if (d?.totalItems) setItemCount(d.totalItems); if (!d?.error) { setContent(""); setTitle(""); } }} disabled={loading || !content.trim()} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-40">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "添加并提取概念"}
          </button>
          {result?.item?.concepts && <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 text-sm"><p className="font-medium">提取的概念：</p><div className="flex flex-wrap gap-1 mt-1">{result.item.concepts.map((c: string, i: number) => <span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: COLORS[i % COLORS.length] + "20", color: COLORS[i % COLORS.length] }}>{c}</span>)}</div><p className="mt-2 text-xs text-muted-foreground">{result.item.summary}</p></div>}
        </div>
      )}

      {tab === "graph" && (
        <div className="space-y-4">
          <button onClick={() => call("graph", {})} disabled={loading || itemCount === 0} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-40">{loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "构建知识图谱"}</button>
          {result?.concepts && <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border p-4"><h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Network className="h-4 w-4" />概念网络</h3>{result.concepts.map((c: any, i: number) => <div key={c.name} className="p-2 rounded-lg border mb-2"><div className="flex items-center gap-2"><span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] + "20", color: COLORS[i % COLORS.length] }}>{c.name}</span><span className="text-xs text-muted-foreground">{c.category === "core" ? "核心" : c.category === "supporting" ? "支撑" : "案例"}</span></div>{c.relatedTo?.length > 0 && <p className="text-xs text-muted-foreground mt-1">关联：{c.relatedTo.join(" · ")}</p>}</div>)}</div>
            <div className="space-y-3">
              {result.themes?.length > 0 && <div className="rounded-xl border p-4"><h3 className="text-sm font-semibold flex items-center gap-2 mb-2"><Tag className="h-4 w-4" />反复讨论的主题</h3><div className="flex flex-wrap gap-1">{result.themes.map((t: string, i: number) => <span key={i} className="px-2 py-1 rounded-full text-xs bg-amber-100 dark:bg-amber-900 text-amber-700">{t}</span>)}</div></div>}
              {result.blindSpots?.length > 0 && <div className="rounded-xl border p-4"><h3 className="text-sm font-semibold flex items-center gap-2 mb-2"><EyeOff className="h-4 w-4" />知识盲区</h3>{result.blindSpots.map((b: string, i: number) => <p key={i} className="text-sm text-muted-foreground">· {b}</p>)}</div>}
              {result.items && <div className="rounded-xl border p-4"><h3 className="text-sm font-semibold flex items-center gap-2 mb-2"><BookOpen className="h-4 w-4" />知识库 ({result.items.length} 条)</h3>{result.items.map((item: any) => <div key={item.id} className="py-1.5 border-b last:border-0 text-sm"><span className="font-medium">{item.title}</span><span className="text-xs text-muted-foreground ml-2">{item.concepts?.length || 0} 个概念</span></div>)}</div>}
            </div>
          </div>}
        </div>
      )}

      {tab === "query" && (
        <div className="space-y-4">
          <div className="flex gap-2"><input type="text" placeholder="我想做「XXX」选题，有什么可复用素材？" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && call("query", { query: query.trim() })} className="flex-1 h-12 px-4 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /><button onClick={() => call("query", { query: query.trim() })} disabled={loading || !query.trim()} className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-40">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}</button></div>
          {result?.suggestedTitle && <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 p-4"><p className="text-xs text-blue-600 font-medium flex items-center gap-1"><Lightbulb className="h-3 w-3" />建议标题</p><p className="font-bold text-lg">{result.suggestedTitle}</p>{result.angle && <p className="text-sm text-muted-foreground mt-1">{result.angle}</p>}</div>}
          {result?.items?.length > 0 && <div className="rounded-xl border p-4"><h3 className="text-sm font-semibold mb-2">可复用素材</h3>{result.items.map((item: any, i: number) => <div key={i} className="py-2 border-b last:border-0"><p className="font-medium text-sm">{item.title}</p><p className="text-xs text-muted-foreground">{item.summary}</p><div className="flex flex-wrap gap-1 mt-1">{item.concepts?.map((c: string, j: number) => <span key={j} className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: COLORS[j % COLORS.length] + "20", color: COLORS[j % COLORS.length] }}>{c}</span>)}</div></div>)}</div>}
        </div>
      )}
    </div>
  );
}
