"use client";

import { useState } from "react";
import { Zap, Loader2, Copy, Check, AlertCircle, Link, FileText } from "lucide-react";

type Tab = "analysis" | "douyin" | "wechat" | "xiaohongshu" | "shipinhao" | "twitter";
const tabNames: Record<Tab, string> = { analysis: "分析", douyin: "抖音", wechat: "公众号", xiaohongshu: "小红书", shipinhao: "视频号", twitter: "推特" };

export default function ReforgePage() {
  const [mode, setMode] = useState<"url" | "script">("script");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("analysis");
  const [copied, setCopied] = useState("");

  async function handleReforge() {
    if (!input.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch("/api/reforge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input: input.trim(), type: mode }) });
      const d = await r.json();
      if (d.error) setError(d.error); else { setResult(d); setTab("analysis"); }
    } catch { setError("请求失败"); }
    setLoading(false);
  }

  function copy(t: string, id: string) { navigator.clipboard.writeText(t).then(() => { setCopied(id); setTimeout(() => setCopied(""), 2000); }); }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div><h1 className="text-2xl font-bold">Reforge</h1><p className="text-muted-foreground">一条长脚本 → 五种平台格式自动适配</p></div>

      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex gap-2">
          <button onClick={() => setMode("script")} className={`px-3 py-1.5 rounded-lg text-sm ${mode === "script" ? "bg-primary text-primary-foreground" : "bg-muted"}`}><FileText className="h-3 w-3 inline mr-1" />粘贴脚本</button>
        </div>
        <textarea placeholder="粘贴完整视频脚本..." value={input} onChange={(e) => setInput(e.target.value)} rows={6} className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
        <button onClick={handleReforge} disabled={loading || !input.trim()} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-40 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}一键复刻
        </button>
      </div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</div>}

      {result && (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">《{result.title}》· {result.wordCount?.toLocaleString()} 字</div>
          <div className="flex gap-1 overflow-x-auto pb-2">{(["analysis", "douyin", "wechat", "xiaohongshu", "shipinhao", "twitter"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`shrink-0 px-3 py-1.5 rounded-lg text-sm ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{tabNames[t]}</button>
          ))}</div>

          <div className="rounded-xl border p-4">
            {tab === "analysis" && result.analysis && (
              <div className="space-y-3">
                <p className="text-sm font-medium">{result.analysis.coreThesis}</p>
                {result.analysis.segments?.map((s: any, i: number) => (
                  <div key={i} className="flex gap-2 text-sm p-2 rounded bg-muted"><span className="text-xs text-muted-foreground w-16 shrink-0">{s.start}-{s.end}</span><span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{s.type}</span><span className="flex-1">{s.summary}</span></div>
                ))}
              </div>
            )}
            {tab === "douyin" && result.outputs?.douyin?.map((d: string, i: number) => (
              <div key={i} className="mb-3"><div className="flex justify-between mb-1"><span className="font-medium text-sm">拆条 #{i + 1}</span><button onClick={() => copy(d, `dy${i}`)} className="text-xs text-muted-foreground">{copied === `dy${i}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}</button></div><pre className="text-sm whitespace-pre-wrap font-sans bg-muted rounded-lg p-3">{d}</pre></div>
            ))}
            {tab === "wechat" && <div><button onClick={() => copy(result.outputs.wechat, "wx")} className="text-xs mb-2 flex items-center gap-1 text-muted-foreground">{copied === "wx" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}复制全文</button><div className="prose prose-sm max-w-none text-sm" dangerouslySetInnerHTML={{ __html: result.outputs.wechat.replace(/\n/g, "<br/>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/^# (.+)/gm, "<h2>$1</h2>").replace(/^## (.+)/gm, "<h3>$1</h3>") }} /></div>}
            {tab === "xiaohongshu" && result.outputs?.xiaohongshu?.map((x: string, i: number) => (
              <div key={i} className="mb-3"><div className="flex justify-between mb-1"><span className="font-medium text-sm">图文帖 #{i + 1}</span><button onClick={() => copy(x, `xhs${i}`)} className="text-xs text-muted-foreground">{copied === `xhs${i}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}</button></div><pre className="text-sm whitespace-pre-wrap font-sans bg-rose-50 dark:bg-rose-950 rounded-lg p-3">{x}</pre></div>
            ))}
            {tab === "shipinhao" && <div><button onClick={() => copy(result.outputs.shipinhao, "sph")} className="text-xs mb-2 flex items-center gap-1 text-muted-foreground">{copied === "sph" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}</button><pre className="text-sm whitespace-pre-wrap font-sans bg-green-50 dark:bg-green-950 rounded-lg p-3">{result.outputs.shipinhao}</pre></div>}
            {tab === "twitter" && result.outputs?.twitter?.map((t: string, i: number) => (
              <div key={i} className="mb-2"><div className="flex justify-between mb-1"><span className="text-xs text-muted-foreground">{i + 1}/{result.outputs.twitter.length}</span><button onClick={() => copy(t, `tw${i}`)} className="text-xs text-muted-foreground">{copied === `tw${i}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}</button></div><pre className="text-sm whitespace-pre-wrap font-sans bg-sky-50 dark:bg-sky-950 rounded-lg p-3">{t}</pre></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
