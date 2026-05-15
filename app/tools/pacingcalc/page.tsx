"use client";

import { useState } from "react";
import { Zap, Loader2, AlertCircle, RefreshCw, Clock, Gauge, Lightbulb, BarChart3 } from "lucide-react";

export default function PacingCalcPage() {
  const [script, setScript] = useState("");
  const [platform, setPlatform] = useState("bilibili");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleCalc() {
    if (!script.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch("/api/pacingcalc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ script: script.trim(), platform }) });
      const d = await r.json();
      if (d.error) setError(d.error); else setResult(d);
    } catch { setError("网络错误"); }
    setLoading(false);
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">PacingCalc</h1>
      <p className="text-muted-foreground -mt-4">粘贴脚本，AI 计算时长 + 节奏分析</p>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">{[{ v: "bilibili", l: "B站 220字/分" }, { v: "douyin", l: "抖音 280字/分" }, { v: "wechat", l: "视频号 250字/分" }].map(({ v, l }) => (
          <button key={v} onClick={() => setPlatform(v)} className={`px-4 py-2 rounded-lg text-sm min-h-[44px] ${platform === v ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{l}</button>
        ))}</div>
        <textarea placeholder="粘贴脚本..." value={script} onChange={(e) => setScript(e.target.value)} rows={6} className="w-full px-3 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
        <button onClick={handleCalc} disabled={loading || !script.trim()} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-40 min-h-[44px] flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}{loading ? "计算中..." : "计算时长"}
        </button>
      </div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between"><span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span><button onClick={handleCalc} className="text-xs flex items-center gap-1 hover:underline min-h-[44px] px-2"><RefreshCw className="h-3 w-3" />重试</button></div>}

      {result && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border p-6 text-center space-y-3">
            <Clock className="h-8 w-8 mx-auto text-muted-foreground" />
            <div><p className="text-sm text-muted-foreground">预估时长</p><p className="text-5xl font-bold">{result.estimatedDuration.optimal}<span className="text-lg text-muted-foreground"> 分钟</span></p></div>
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <span>最快 {result.estimatedDuration.min}分</span><span>·</span><span>最慢 {result.estimatedDuration.max}分</span>
            </div>
            <p className="text-xs text-muted-foreground">总字数：{result.wordCount.toLocaleString()} 字</p>
          </div>

          <div className="space-y-3">
            {result.pacing?.map((p: any, i: number) => (
              <div key={i} className="rounded-xl border p-3">
                <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium">{p.label}</span><span className={`text-sm font-bold ${p.score >= 8 ? "text-green-500" : p.score >= 5 ? "text-yellow-500" : "text-red-500"}`}>{p.score}/10</span></div>
                <div className="h-1.5 rounded-full bg-muted mb-1"><div className={`h-full rounded-full ${p.score >= 8 ? "bg-green-500" : p.score >= 5 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${p.score * 10}%` }} /></div>
                <p className="text-xs text-muted-foreground">{p.tip}</p>
              </div>
            ))}
            {result.suggestions?.length > 0 && <div className="rounded-xl bg-blue-50 dark:bg-blue-950 p-3 text-sm flex items-start gap-2"><Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /><span>{result.suggestions[0]}</span></div>}
          </div>
        </div>
      )}
    </div>
  );
}
