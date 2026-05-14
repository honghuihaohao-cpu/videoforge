"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowLeft, GitCompare } from "lucide-react";
import Link from "next/link";

export default function ComparePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

  useEffect(() => {
    fetch("/api/projects?withVideoData=true").then((r) => r.json()).then((d) => { setProjects(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const project1 = projects.find((p) => p.id === p1);
  const project2 = projects.find((p) => p.id === p2);
  const v1 = project1?.videoData;
  const v2 = project2?.videoData;

  const comparisonData = v1 && v2 ? [
    { metric: "播放量", a: v1.views || 0, b: v2.views || 0 },
    { metric: "点赞率", a: v1.views ? +((v1.likes / v1.views) * 100).toFixed(1) : 0, b: v2.views ? +((v2.likes / v2.views) * 100).toFixed(1) : 0 },
    { metric: "评论率", a: v1.views ? +((v1.comments / v1.views) * 100).toFixed(1) : 0, b: v2.views ? +((v2.comments / v2.views) * 100).toFixed(1) : 0 },
    { metric: "分享率", a: v1.views ? +((v1.shares / v1.views) * 100).toFixed(1) : 0, b: v2.views ? +((v2.shares / v2.views) * 100).toFixed(1) : 0 },
    { metric: "收藏率", a: v1.views ? +((v1.favorites / v1.views) * 100).toFixed(1) : 0, b: v2.views ? +((v2.favorites / v2.views) * 100).toFixed(1) : 0 },
  ] : [];

  if (loading) return <div className="p-8 text-muted-foreground">加载中...</div>;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">项目对比</h1>
      </div>

      {/* Project selectors */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">项目 A</CardTitle></CardHeader>
          <CardContent>
            <select className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" value={p1} onChange={(e) => setP1(e.target.value)}>
              <option value="">选择项目...</option>
              {projects.filter((p) => p.videoData).map((p) => (<option key={p.id} value={p.id}>{p.title || "未命名"} ({p.videoData?.views?.toLocaleString()} 播放)</option>))}
            </select>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">项目 B</CardTitle></CardHeader>
          <CardContent>
            <select className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" value={p2} onChange={(e) => setP2(e.target.value)}>
              <option value="">选择项目...</option>
              {projects.filter((p) => p.videoData).map((p) => (<option key={p.id} value={p.id}>{p.title || "未命名"} ({p.videoData?.views?.toLocaleString()} 播放)</option>))}
            </select>
          </CardContent>
        </Card>
      </div>

      {v1 && v2 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Side-by-side metric cards */}
          <div className="grid gap-4 content-start">
            {comparisonData.map((d) => (
              <Card key={d.metric}>
                <CardHeader className="py-2 px-4"><CardTitle className="text-sm">{d.metric}</CardTitle></CardHeader>
                <CardContent className="py-2 px-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-xs text-muted-foreground">{project1?.title?.slice(0, 12) || "A"}</p>
                      <p className="font-bold text-lg">{d.a.toLocaleString()}{d.metric.includes("率") ? "%" : ""}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">vs</div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-muted-foreground">{project2?.title?.slice(0, 12) || "B"}</p>
                      <p className="font-bold text-lg">{d.b.toLocaleString()}{d.metric.includes("率") ? "%" : ""}</p>
                    </div>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (Math.max(d.a, d.b) > 0 ? (d.a / Math.max(d.a, d.b)) * 100 : 0))}%` }} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Radar chart */}
          <Card className="h-[450px]">
            <CardHeader><CardTitle className="text-sm">综合对比雷达图</CardTitle></CardHeader>
            <CardContent className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={comparisonData}>
                  <PolarGrid /><PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} /><PolarRadiusAxis />
                  <Radar name={project1?.title?.slice(0, 12) || "A"} dataKey="a" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  <Radar name={project2?.title?.slice(0, 12) || "B"} dataKey="b" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                  <Legend /><Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <GitCompare className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground">选择两个有视频数据的项目来对比。</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
