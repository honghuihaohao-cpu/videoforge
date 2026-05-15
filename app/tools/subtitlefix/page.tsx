"use client";

import { useState } from "react";
import { Zap, Loader2, Copy, Check, AlertCircle, RefreshCw, Type, Wand2 } from "lucide-react";

export default function SubtitleFixPage() {
  const [subtitles, setSubtitles] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  async function handleFix() {
    if (!subtitles.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch("/api/subtitlefix", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subtitles: subtitles.trim() }) });
      const d = await r.json();
      if (d.error) setError(d.error); else setResult(d);
    } catch { setError("网络错误"); }
    setLoading(false);
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">SubtitleFix</h1>
      <p className="text-muted-foreground -mt-4">粘贴字幕文本，AI 自动修正错别字、优化断句、纠正专业术语</p>

      <div className="rounded-xl border p-4 space-y-3">
        <textarea placeholder="粘贴字幕文本（SRT/剪映导出/手动整理）..." value={subtitles} onChange={(e) => setSubtitles(e.target.value)} rows={8} className="w-full px-3 py-3 rounded-lg border text-base font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
        <button onClick={handleFix} disabled={loading || !subtitles.trim()} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-40 min-h-[44px] flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}{loading ? "AI 修正中..." : "修正字幕"}
        </button>
      </div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between"><span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span><button onClick={handleFix} className="text-xs flex items-center gap-1 hover:underline min-h-[44px] px-2"><RefreshCw className="h-3 w-3" />重试</button></div>}

      {result?.corrected && (
        <div className="space-y-4">
          {result.stats && (
            <div className="flex gap-3 flex-wrap">
              {Object.entries({ typos: "错别字", breaks: "断句", terms: "术语" }).map(([k, v]) => (
                <div key={k} className="rounded-lg bg-muted px-3 py-2 text-sm"><span className="text-muted-foreground">{v}修正 </span><span className="font-bold">{result.stats[k]}</span></div>
              ))}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border p-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2"><Type className="h-4 w-4" />修正后</h3>
              <div className="relative">
                <pre className="text-sm whitespace-pre-wrap font-sans bg-muted rounded-lg p-3 max-h-96 overflow-y-auto">{result.corrected}</pre>
                <button onClick={() => { navigator.clipboard.writeText(result.corrected); setCopied("corrected"); setTimeout(() => setCopied(""), 2000); }} className="absolute top-2 right-2 min-h-[44px] px-2 bg-background/80 rounded text-xs flex items-center gap-1">{copied === "corrected" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}复制全部</button>
              </div>
            </div>

            {result.changes?.length > 0 && (
              <div className="rounded-xl border p-4">
                <h3 className="text-sm font-semibold mb-3">修改记录</h3>
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {result.changes.map((c: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-muted">
                      <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${c.type === "typo" ? "bg-red-100 text-red-700" : c.type === "break" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>{c.type === "typo" ? "错字" : c.type === "break" ? "断句" : "术语"}</span>
                      <span className="line-through text-red-400 text-xs">{c.original}</span>
                      <span>→</span>
                      <span className="text-green-600 text-xs">{c.corrected}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
