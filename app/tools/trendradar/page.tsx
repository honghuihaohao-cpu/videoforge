"use client";

import { useState } from "react";
import { Zap, Loader2, AlertCircle, RefreshCw, TrendingUp, Flame, Users, Target } from "lucide-react";

export default function TrendRadarPage() {
  const [platform, setPlatform] = useState("bilibili");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleSpot() {
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch("/api/trendradar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform, niche: niche.trim() }) });
      const d = await r.json();
      if (d.error) setError(d.error); else setResult(d);
    } catch { setError("网络错误"); }
    setLoading(false);
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">TrendRadar</h1>
      <p className="text-muted-foreground -mt-4">AI 推荐当前值得追的热点趋势和选题方向</p>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">{[{ v: "bilibili", l: "B站" }, { v: "douyin", l: "抖音" }, { v: "wechat", l: "视频号" }].map(({ v, l }) => (
          <button key={v} onClick={() => setPlatform(v)} className={`px-4 py-2 rounded-lg text-sm min-h-[44px] ${platform === v ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{l}</button>
        ))}</div>
        <input type="text" placeholder="你的内容领域（可选）... 例如：科技、职场、历史、美食" value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={handleSpot} disabled={loading} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-40 min-h-[44px] flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}{loading ? "AI 扫描趋势中..." : "扫描热点趋势"}
        </button>
      </div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between"><span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span><button onClick={handleSpot} className="text-xs flex items-center gap-1 hover:underline min-h-[44px] px-2"><RefreshCw className="h-3 w-3" />重试</button></div>}

      {result?.summary && <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 text-sm">{result.summary}</div>}

      {result?.trends && (
        <div className="grid gap-3">
          {result.trends.map((t: any, i: number) => (
            <div key={i} className="rounded-xl border p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{i === 0 ? "🔥" : i === 1 ? "⚡" : i === 2 ? "💡" : "📌"}</span>
                  <div>
                    <h3 className="font-semibold">{t.topic}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1"><Flame className="h-3 w-3" />热度 {t.heat}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.competition === "高" ? "bg-red-100 text-red-700" : t.competition === "中" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>竞争 {t.competition}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><Target className="h-3 w-3" />{t.fit}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{t.angle}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
