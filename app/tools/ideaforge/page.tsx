"use client";

import { useState } from "react";
import { Zap, Loader2, AlertCircle, RefreshCw, Lightbulb, Flame, Target, Users, Clock } from "lucide-react";

export default function IdeaForgePage() {
  const [idea, setIdea] = useState("");
  const [platform, setPlatform] = useState("bilibili");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!idea.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch("/api/ideaforge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea: idea.trim(), platform }) });
      const d = await r.json();
      if (d.error) setError(d.error); else setResult(d);
    } catch { setError("网络错误"); }
    setLoading(false);
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">IdeaForge</h1>
      <p className="text-muted-foreground -mt-4">输入一个模糊想法，AI 扩写成 10 个完整的视频方案</p>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">{[{ v: "bilibili", l: "B站" }, { v: "douyin", l: "抖音" }, { v: "wechat", l: "视频号" }].map(({ v, l }) => (
          <button key={v} onClick={() => setPlatform(v)} className={`px-4 py-2 rounded-lg text-sm min-h-[44px] ${platform === v ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{l}</button>
        ))}</div>
        <input type="text" placeholder="输入一个模糊的想法..." value={idea} onChange={(e) => setIdea(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleGenerate()} className="w-full min-h-[44px] px-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={handleGenerate} disabled={loading || !idea.trim()} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-40 min-h-[44px] flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}{loading ? "AI 孵化创意中..." : "孵化创意"}
        </button>
      </div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between"><span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span><button onClick={handleGenerate} className="text-xs flex items-center gap-1 hover:underline min-h-[44px] px-2"><RefreshCw className="h-3 w-3" />重试</button></div>}

      {result?.concepts && (
        <div className="grid gap-4">
          {result.concepts.map((c: any, i: number) => (
            <div key={i} className="rounded-xl border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <span className="text-3xl font-bold text-muted-foreground/30 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1 min-w-0 space-y-2">
                  <h3 className="font-bold text-lg">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">{c.premise}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {c.angle && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 flex items-center gap-1"><Target className="h-3 w-3" />{c.angle}</span>}
                    {c.heat && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 flex items-center gap-1"><Flame className="h-3 w-3" />热度 {c.heat}</span>}
                    {c.audience && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 flex items-center gap-1"><Users className="h-3 w-3" />{c.audience}</span>}
                    {c.duration && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 flex items-center gap-1"><Clock className="h-3 w-3" />{c.duration}分钟</span>}
                  </div>
                  {c.difficulty && <p className="text-xs text-muted-foreground">制作难度：{c.difficulty} · {c.keyPoints}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
