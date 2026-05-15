"use client";

import { useState } from "react";
import { Zap, Loader2, Copy, Check, AlertCircle, RefreshCw, Hash } from "lucide-react";

export default function SEODescPage() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [platform, setPlatform] = useState("bilibili");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  async function handleGenerate() {
    if (!title.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch("/api/seodesc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: title.trim(), summary: summary.trim(), platform }) });
      const d = await r.json();
      if (d.error) setError(d.error); else setResult(d);
    } catch { setError("网络错误"); }
    setLoading(false);
  }

  function copy(t: string, id: string) { navigator.clipboard.writeText(t).then(() => { setCopied(id); setTimeout(() => setCopied(""), 2000); }); }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">SEODesc</h1>
      <p className="text-muted-foreground -mt-4">输入标题和概述，AI 生成 SEO 优化的视频简介 + 标签 + 话题</p>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">{[{ v: "bilibili", l: "B站" }, { v: "douyin", l: "抖音" }, { v: "wechat", l: "视频号" }].map(({ v, l }) => (
          <button key={v} onClick={() => setPlatform(v)} className={`px-4 py-2 rounded-lg text-sm min-h-[44px] ${platform === v ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{l}</button>
        ))}</div>
        <input type="text" placeholder="视频标题..." value={title} onChange={(e) => setTitle(e.target.value)} className="w-full min-h-[44px] px-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <textarea placeholder="内容概述（可选）..." value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
        <button onClick={handleGenerate} disabled={loading || !title.trim()} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-40 min-h-[44px] flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}{loading ? "生成中..." : "生成简介和标签"}
        </button>
      </div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between"><span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span><button onClick={handleGenerate} className="text-xs flex items-center gap-1 hover:underline min-h-[44px] px-2"><RefreshCw className="h-3 w-3" />重试</button></div>}

      {result && (
        <div className="space-y-4">
          {result.description && (
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold">视频简介</h3><button onClick={() => copy(result.description, "desc")} className="text-xs flex items-center gap-1 min-h-[44px] px-2 text-muted-foreground hover:text-foreground">{copied === "desc" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}复制</button></div>
              <p className="text-sm whitespace-pre-wrap">{result.description}</p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {result.tags?.length > 0 && (
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold flex items-center gap-1"><Hash className="h-3 w-3" />标签</h3><button onClick={() => copy(result.tags.join(", "), "tags")} className="text-xs flex items-center gap-1 min-h-[44px] px-2 text-muted-foreground hover:text-foreground">{copied === "tags" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}复制</button></div>
                <div className="flex flex-wrap gap-1">{result.tags.map((t: string) => <span key={t} className="px-2 py-1 rounded text-xs bg-muted">{t}</span>)}</div>
              </div>
            )}
            {result.hashtags?.length > 0 && (
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2"><h3 className="text-sm font-semibold flex items-center gap-1"><Hash className="h-3 w-3" />话题</h3><button onClick={() => copy(result.hashtags.join(" "), "hash")} className="text-xs flex items-center gap-1 min-h-[44px] px-2 text-muted-foreground hover:text-foreground">{copied === "hash" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}复制</button></div>
                <div className="flex flex-wrap gap-1">{result.hashtags.map((h: string) => <span key={h} className="px-2 py-1 rounded text-xs bg-blue-50 dark:bg-blue-950 text-blue-600">{h}</span>)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
