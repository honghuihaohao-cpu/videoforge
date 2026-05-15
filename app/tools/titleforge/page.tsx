"use client";

import { useState } from "react";
import { Zap, Loader2, Copy, Check, AlertCircle, RefreshCw, TrendingUp } from "lucide-react";

export default function TitleForgePage() {
  const [desc, setDesc] = useState("");
  const [platform, setPlatform] = useState("bilibili");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  async function handleGenerate() {
    if (!desc.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch("/api/titleforge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: desc.trim(), platform }) });
      const d = await r.json();
      if (d.error) setError(d.error); else setResult(d);
    } catch { setError("网络错误，请重试"); }
    setLoading(false);
  }

  function copy(t: string) { navigator.clipboard.writeText(t).then(() => { setCopied(t); setTimeout(() => setCopied(""), 2000); }); }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">TitleForge</h1>
      <p className="text-muted-foreground -mt-4">输入视频内容描述，AI 生成三平台高 CTR 标题</p>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {[{ v: "bilibili", l: "B站" }, { v: "douyin", l: "抖音" }, { v: "wechat", l: "视频号" }].map(({ v, l }) => (
            <button key={v} onClick={() => setPlatform(v)} className={`px-4 py-2 rounded-lg text-sm min-h-[44px] ${platform === v ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{l}</button>
          ))}
        </div>
        <textarea placeholder="描述你的视频内容... 例如：一个20分钟深度科普视频，讲 AI 工程范式从 Prompt Engineering 到 Context Engineering 再到 Harness Engineering 的演进，目标是 B 站科技区观众..." value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className="w-full px-3 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
        <button onClick={handleGenerate} disabled={loading || !desc.trim()} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-40 min-h-[44px] flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}{loading ? "AI 生成中..." : "生成标题"}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between"><span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span><button onClick={handleGenerate} className="text-xs flex items-center gap-1 hover:underline min-h-[44px] px-2"><RefreshCw className="h-3 w-3" />重试</button></div>
      )}

      {result?.titles && (
        <div className="space-y-3">
          {result.tips && <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 text-sm">{result.tips}</div>}
          {result.titles.map((t: any, i: number) => (
            <div key={i} className="rounded-xl border p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-lg">{t.text}</p>
                  <button onClick={() => copy(t.text)} className="shrink-0 min-h-[44px] px-2 text-muted-foreground hover:text-foreground">{copied === t.text ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}</button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{t.reason}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${t.predictedCTR >= 80 ? "bg-green-100 text-green-700" : t.predictedCTR >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>CTR {t.predictedCTR}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
