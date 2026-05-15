"use client";

import { useState, useCallback, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Upload, Loader2, Trophy, AlertCircle, Check, X, Zap } from "lucide-react";
import type { CoverResult, Platform } from "@/lib/cover-judge";

const platformNames: Record<Platform, string> = { bilibili: "B站", douyin: "抖音", wechat: "视频号" };
const platformColors: Record<Platform, string> = { bilibili: "#00a1d6", douyin: "#ff0044", wechat: "#07c160" };

export default function CoverJudgePage() {
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);
  const [platform, setPlatform] = useState<Platform>("bilibili");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<CoverResult[] | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const a = Array.from(e.target.files || []);
    if (a.length + files.length > 4) { setError("最多 4 张"); return; }
    setError("");
    setFiles((p) => [...p, ...a.map((f) => Object.assign(f, { preview: URL.createObjectURL(f) }))]);
    if (e.target) e.target.value = "";
  }

  async function analyze() {
    if (files.length < 2) { setError("至少 2 张"); return; }
    setAnalyzing(true); setError(""); setResults(null);
    const images = await Promise.all(files.map(async (f) => ({ base64: Buffer.from(await f.arrayBuffer()).toString("base64"), filename: f.name })));
    try {
      const r = await fetch("/api/analyze/cover", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ images, platform }) });
      const d = await r.json();
      if (d.error) setError(d.error); else setResults(d);
    } catch { setError("分析失败"); }
    setAnalyzing(false);
  }

  const chartData = results?.map((r) => ({ name: r.filename.slice(0, 15), B站: r.scores.bilibili, 抖音: r.scores.douyin, 视频号: r.scores.wechat, 综合: r.overallCTR })) || [];

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div><h1 className="text-2xl font-bold">CoverJudge</h1><p className="text-muted-foreground">上传 2-4 张封面，AI 预测三平台 CTR</p></div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div onClick={() => fileInputRef.current?.click()} className="rounded-xl border-2 border-dashed p-6 text-center cursor-pointer hover:border-zinc-400">
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
          <Upload className="h-6 w-6 mx-auto text-zinc-400 mb-1" />
          <p className="text-sm">点击上传封面</p>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">{(["bilibili", "douyin", "wechat"] as Platform[]).map((p) => (
            <button key={p} onClick={() => setPlatform(p)} className={`px-4 py-1.5 rounded-lg text-sm ${platform === p ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{platformNames[p]}</button>
          ))}</div>
          <button onClick={analyze} disabled={analyzing || files.length < 2} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-40 flex items-center justify-center gap-2">
            {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}开始分析 ({files.length} 张)
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {files.map((f, i) => (
            <div key={f.name} className="relative group rounded overflow-hidden border">
              <img src={f.preview} className="w-full aspect-video object-cover" />
              <button onClick={() => { URL.revokeObjectURL(f.preview); setFiles(files.filter((_, j) => j !== i)); }} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      )}
      {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</div>}

      {results && (
        <div className="space-y-6">
          {results[0] && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 p-4 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-amber-500" />
              <div><p className="text-sm text-amber-600 font-medium">最佳封面</p><p className="font-bold">{results[0].filename} — CTR {results[0].overallCTR}/100</p></div>
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-4">
            {results.map((r, i) => (
              <div key={r.filename} className={`rounded-xl border p-3 space-y-2 ${i === 0 ? "ring-2 ring-amber-400" : ""}`}>
                <div className="flex justify-between text-xs"><span className="truncate">{r.filename}</span><span className="font-bold">#{i + 1}</span></div>
                {(["bilibili", "douyin", "wechat"] as Platform[]).map((p) => (
                  <div key={p} className="flex items-center gap-2 text-xs"><span style={{ color: platformColors[p] }} className="w-10">{platformNames[p]}</span><div className="flex-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${r.scores[p] || 0}%`, backgroundColor: platformColors[p] }} /></div><span>{r.scores[p]}</span></div>
                ))}
                <div className="text-xs space-y-0.5">
                  {r.strengths.slice(0, 2).map((s, j) => <p key={j} className="flex gap-1"><Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />{s}</p>)}
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border p-4"><h3 className="text-sm font-semibold mb-3">分平台 CTR</h3>
              <ResponsiveContainer width="100%" height={250}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} /><Tooltip /><Legend /><Bar dataKey="B站" fill="#00a1d6" radius={[3,3,0,0]} /><Bar dataKey="抖音" fill="#ff0044" radius={[3,3,0,0]} /><Bar dataKey="视频号" fill="#07c160" radius={[3,3,0,0]} /></BarChart></ResponsiveContainer></div>
            <div className="rounded-xl border p-4"><h3 className="text-sm font-semibold mb-3">综合雷达</h3>
              <ResponsiveContainer width="100%" height={250}><RadarChart data={chartData}><PolarGrid /><PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} /><PolarRadiusAxis domain={[0, 100]} /><Radar name="综合" dataKey="综合" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} /></RadarChart></ResponsiveContainer></div>
          </div>
        </div>
      )}
    </div>
  );
}
