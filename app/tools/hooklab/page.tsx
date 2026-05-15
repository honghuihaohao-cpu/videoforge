"use client";

import { useState } from "react";
import { Zap, Loader2, Copy, Check, AlertCircle, RefreshCw, Target, Users } from "lucide-react";

const styleIcons: Record<string, string> = { "提问式": "❓", "数据冲击": "📊", "故事开场": "📖", "争议反转": "⚡", "幽默共鸣": "😂" };

export default function HookLabPage() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("bilibili");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch("/api/hooklab", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic: topic.trim(), audience: audience.trim(), platform }) });
      const d = await r.json();
      if (d.error) setError(d.error); else setResult(d);
    } catch { setError("网络错误"); }
    setLoading(false);
  }

  function copy(t: string) { navigator.clipboard.writeText(t).then(() => { setCopied(t); setTimeout(() => setCopied(""), 2000); }); }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">HookLab</h1>
      <p className="text-muted-foreground -mt-4">AI 生成 5 种风格的开场钩子，预测留存率 + 目标人群</p>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">{[{ v: "bilibili", l: "B站" }, { v: "douyin", l: "抖音" }, { v: "wechat", l: "视频号" }].map(({ v, l }) => (
          <button key={v} onClick={() => setPlatform(v)} className={`px-4 py-2 rounded-lg text-sm min-h-[44px] ${platform === v ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{l}</button>
        ))}</div>
        <input type="text" placeholder="视频主题... 例如：AI 取代人类程序员？" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="text" placeholder="目标受众（可选）... 例如：25-35岁科技从业者" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-40 min-h-[44px] flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}{loading ? "生成中..." : "生成 5 种钩子"}
        </button>
      </div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between"><span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span><button onClick={handleGenerate} className="text-xs flex items-center gap-1 hover:underline min-h-[44px] px-2"><RefreshCw className="h-3 w-3" />重试</button></div>}

      {result?.hooks && (
        <div className="grid gap-3">
          {result.hooks.map((h: any, i: number) => (
            <div key={i} className={`rounded-xl border p-4 ${i === 0 ? "ring-2 ring-amber-400 bg-amber-50/30 dark:bg-amber-950/20" : ""}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{styleIcons[h.style] || "💡"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-muted">{h.style}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${h.predictedRetention >= 75 ? "bg-green-100 text-green-700" : h.predictedRetention >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>留存 {h.predictedRetention}%</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />{h.bestAudience}</span>
                  </div>
                  <p className="text-lg font-medium">{h.hook}</p>
                  <button onClick={() => copy(h.hook)} className="text-xs text-muted-foreground hover:text-foreground mt-1 flex items-center gap-1 min-h-[44px]">{copied === h.hook ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}复制</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
