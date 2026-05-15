"use client";

import { useState } from "react";
import { Zap, Loader2, AlertCircle, RefreshCw, TrendingUp, Gauge, Brain, Eye, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

const dimensionIcons: Record<string, any> = { pace: Gauge, logic: Brain, density: Eye, hooks: Lightbulb };
const dimensionNames: Record<string, string> = { pace: "节奏", logic: "逻辑", density: "信息密度", hooks: "钩子" };

export default function ScriptDoctorPage() {
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  async function handleDiagnose() {
    if (!script.trim() || script.trim().length < 50) { setError("脚本至少50字"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch("/api/scriptdoctor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ script: script.trim() }) });
      const d = await r.json();
      if (d.error) setError(d.error); else setResult(d);
    } catch { setError("网络错误"); }
    setLoading(false);
  }

  const dims = result ? ["pace", "logic", "density", "hooks"] as const : [];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">ScriptDoctor</h1>
      <p className="text-muted-foreground -mt-4">粘贴脚本，AI 诊断节奏、逻辑、信息密度、钩子质量</p>

      <div className="rounded-xl border p-4 space-y-3">
        <textarea placeholder="粘贴完整视频脚本..." value={script} onChange={(e) => setScript(e.target.value)} rows={8} className="w-full px-3 py-3 rounded-lg border text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
        <button onClick={handleDiagnose} disabled={loading || !script.trim()} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-40 min-h-[44px] flex items-center justify-center gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}{loading ? "AI 诊断中..." : "诊断脚本"}
        </button>
      </div>
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between"><span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span><button onClick={handleDiagnose} className="text-xs flex items-center gap-1 hover:underline min-h-[44px] px-2"><RefreshCw className="h-3 w-3" />重试</button></div>}

      {result && (
        <div className="space-y-6">
          {/* Overall score */}
          <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 p-6 text-center">
            <p className="text-sm text-blue-600 font-medium">综合评分</p>
            <p className="text-5xl font-bold text-blue-700">{result.overallScore}</p>
            <p className="text-sm text-muted-foreground mt-1">/100</p>
          </div>

          {/* Dimension cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {dims.map((dim) => {
              const Icon = dimensionIcons[dim];
              const data = result[dim];
              if (!data) return null;
              return (
                <div key={dim} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold flex items-center gap-2"><Icon className="h-4 w-4" />{dimensionNames[dim]}</h3>
                    <span className={`text-lg font-bold ${data.rating >= 8 ? "text-green-500" : data.rating >= 5 ? "text-yellow-500" : "text-red-500"}`}>{data.rating}/10</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted mb-2"><div className={`h-full rounded-full ${data.rating >= 8 ? "bg-green-500" : data.rating >= 5 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${data.rating * 10}%` }} /></div>
                  {(data.issues || data.gaps || data.overloadZones || data.suggestions)?.length > 0 && (
                    <button onClick={() => setExpanded({ ...expanded, [dim]: !expanded[dim] })} className="text-xs text-muted-foreground flex items-center gap-1">
                      {expanded[dim] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {expanded[dim] ? "收起" : `查看详情 (${(data.issues || data.gaps || data.overloadZones || data.suggestions).length})`}
                    </button>
                  )}
                  {expanded[dim] && (
                    <div className="mt-2 space-y-1">
                      {(data.issues || data.gaps || data.overloadZones || data.suggestions)?.map((item: string, i: number) => (
                        <p key={i} className="text-xs text-muted-foreground">· {item}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Top fixes */}
          {result.topFixes?.length > 0 && (
            <div className="rounded-xl border p-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><TrendingUp className="h-4 w-4" />优先修复项</h3>
              {result.topFixes.map((f: any, i: number) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted mb-2">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${f.priority === 1 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>P{f.priority}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{f.problem}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">📍 {f.location} → {f.fix}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
