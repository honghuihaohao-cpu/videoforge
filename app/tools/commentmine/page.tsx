"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Search, Loader2, TrendingUp, Lightbulb, Quote, AlertCircle, RefreshCw } from "lucide-react";

const TOPIC_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function CommentMinePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleMine() {
    if (!url.trim()) return;
    setLoading(true); setError(""); setReport(null);
    try {
      const r = await fetch("/api/mine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videoUrl: url.trim() }) });
      const d = await r.json();
      if (d.error) setError(d.error); else setReport(d);
    } catch { setError("网络错误，请重试"); }
    setLoading(false);
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">CommentMine</h1>
      <p className="text-muted-foreground -mt-4">输入B站视频链接，AI 挖掘评论金矿</p>

      <div className="flex gap-2">
        <input type="text" placeholder="粘贴B站视频链接或BV号..." value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleMine()} className="flex-1 min-h-[44px] px-4 rounded-xl border text-base focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={handleMine} disabled={loading || !url.trim()} className="min-h-[44px] px-6 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-40 flex items-center gap-2 shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}{loading ? "分析中" : "挖掘"}
        </button>
      </div>

      {loading && (
        <div className="rounded-xl border p-8 text-center space-y-3">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">正在拉取评论并分析...</p>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between gap-2">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{error}</span>
          <button onClick={handleMine} className="text-xs flex items-center gap-1 hover:underline shrink-0 min-h-[44px] px-2"><RefreshCw className="h-3 w-3" />重试</button>
        </div>
      )}

      {report && (
        <div className="space-y-6">
          <div className="text-center"><h2 className="text-xl font-bold">{report.videoTitle}</h2><p className="text-sm text-muted-foreground">分析了 {report.totalComments} 条评论</p></div>
          <div className="rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 p-4 text-sm">{report.summary}</div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {report.topics?.length > 0 && (
              <div className="rounded-xl border p-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><TrendingUp className="h-4 w-4" />话题分布</h3>
                <div className="space-y-2">{report.topics.map((t: any, i: number) => (
                  <div key={t.label}><div className="flex justify-between text-xs mb-0.5"><span>{t.label}</span><span className="text-muted-foreground shrink-0">{t.percentage}%（{t.count}条）</span></div><div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${t.percentage}%`, backgroundColor: TOPIC_COLORS[i % TOPIC_COLORS.length] }} /></div></div>
                ))}</div>
              </div>
            )}
            {(report.sentiment?.positive + report.sentiment?.neutral + report.sentiment?.negative > 0) && (
              <div className="rounded-xl border p-4"><h3 className="text-sm font-semibold mb-3">情绪分布</h3>
                <div className="min-h-[200px]"><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={[{ name: "正面", value: report.sentiment.positive }, { name: "中性", value: report.sentiment.neutral }, { name: "负面", value: report.sentiment.negative }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }: any) => `${name}: ${value}%`}>{[0, 1, 2].map((i) => <Cell key={i} fill={["#10b981", "#f59e0b", "#ef4444"][i]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></div>
            )}
          </div>

          {report.goldenQuotes?.length > 0 && (
            <div className="rounded-xl border p-4"><h3 className="text-sm font-semibold flex items-center gap-2 mb-3"><Quote className="h-4 w-4" />传播金句</h3>
              {report.goldenQuotes.map((q: any, i: number) => <div key={i} className="flex gap-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-950 mb-2"><span className="text-lg shrink-0">&ldquo;</span><p className="text-sm flex-1">{q.quote}</p><span className="text-xs text-muted-foreground shrink-0">引用 {q.count} 次</span></div>)}
            </div>
          )}

          {report.requests?.length > 0 && (
            <div className="rounded-xl border p-4"><h3 className="text-sm font-semibold flex items-center gap-2 mb-2"><Lightbulb className="h-4 w-4" />观众选题请求</h3><ul className="space-y-1">{report.requests.map((r: string, i: number) => <li key={i} className="text-sm flex gap-2"><span className="text-blue-500 shrink-0">▸</span>{r}</li>)}</ul></div>
          )}

          {report.nextTopics?.length > 0 && (
            <div className="rounded-xl border p-4"><h3 className="text-sm font-semibold mb-3">AI 推荐下期选题</h3><div className="grid gap-3 grid-cols-1 sm:grid-cols-2">{report.nextTopics.map((t: any, i: number) => (
              <div key={i} className="p-3 rounded-lg border"><div className="flex justify-between mb-1"><span className="font-medium text-sm">{t.title}</span><span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${t.expectedScore >= 80 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{t.expectedScore}分</span></div><p className="text-xs text-muted-foreground">{t.reason}</p></div>
            ))}</div></div>
          )}
        </div>
      )}
    </div>
  );
}
