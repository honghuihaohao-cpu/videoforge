"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { RefreshCw, Plus, Sparkles, Loader2, Upload, FileText } from "lucide-react";
import { AnalyticsSkeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bvid, setBvid] = useState("");
  const [fetching, setFetching] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [manualData, setManualData] = useState({
    views: "", likes: "", comments: "", shares: "", favorites: "", coins: "",
  });
  const [retentionInput, setRetentionInput] = useState("");
  const [audienceInput, setAudienceInput] = useState("");
  const [aiReviewResult, setAiReviewResult] = useState<string | null>(null);
  const [aiReviewScore, setAiReviewScore] = useState<number | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [csvText, setCsvText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/projects?withVideoData=true");
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  }

  async function fetchBilibiliData() {
    if (!bvid.trim() || !selectedProjectId) {
      toast.error("请输入 BV 号并选择项目"); return;
    }
    setFetching(true);
    try {
      const res = await fetch(`/api/platform/bilibili?videoId=${bvid}&projectId=${selectedProjectId}`);
      const d = await res.json();
      if (d.error) { toast.error(d.error); } else {
        toast.success(`数据已拉取：${d.views.toLocaleString()} 次播放`);
        loadData();
      }
    } catch { toast.error("拉取失败"); }
    setFetching(false);
  }

  async function submitManualData() {
    if (!selectedProjectId) { toast.error("请选择项目"); return; }
    try {
      const res = await fetch("/api/projects/video-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          ...Object.fromEntries(Object.entries(manualData).map(([k, v]) => [k, parseInt(v) || 0])),
          retentionData: retentionInput || undefined,
          audienceData: audienceInput || undefined,
        }),
      });
      if (res.ok) { toast.success("数据已保存"); loadData(); } else toast.error("保存失败");
    } catch { toast.error("保存失败"); }
  }

  async function handleCsvImport() {
    if (!csvText.trim() || !selectedProjectId) { toast.error("请粘贴 CSV 内容并选择项目"); return; }
    const lines = csvText.trim().split("\n").filter(Boolean);
    if (lines.length < 2) { toast.error("CSV 至少需要标题行 + 1 行数据"); return; }
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const vals = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = vals[i] || ""; });
      return row;
    });
    try {
      const res = await fetch("/api/projects/csv-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProjectId, rows }),
      });
      const d = await res.json();
      if (d.error) { toast.error(d.error); } else {
        toast.success(`CSV 导入成功：${d.imported} 行数据`);
        loadData();
      }
    } catch { toast.error("导入失败"); }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCsvText(ev.target?.result as string);
      toast.success(`已读取：${file.name}`);
    };
    reader.readAsText(file);
  }

  async function handleAiReview() {
    if (!selectedProjectId) { toast.error("请选择项目"); return; }
    const project = projects.find((p) => p.id === selectedProjectId);
    const vd = project?.videoData;
    setReviewing(true);
    try {
      const res = await fetch("/api/analyze/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          views: vd?.views || 0,
          likes: vd?.likes || 0,
          comments: vd?.comments || 0,
          shares: vd?.shares || 0,
          favorites: vd?.favorites || 0,
          retentionData: vd?.retentionData || undefined,
          audienceData: vd?.audienceData || undefined,
          platform: project?.platform || "bilibili",
        }),
      });
      const d = await res.json();
      if (d.error) { toast.error(d.error); } else {
        setAiReviewResult(d.content);
        setAiReviewScore(d.score);
        toast.success(`AI 复盘完成：${d.score}/100`);
      }
    } catch { toast.error("AI 分析失败"); }
    setReviewing(false);
  }

  // Charts data
  const chartData = projects
    .filter((p) => p.videoData)
    .map((p) => ({
      name: p.title?.slice(0, 15) || "未命名",
      platform: p.platform,
      views: p.videoData?.views || 0,
      likes: p.videoData?.likes || 0,
      comments: p.videoData?.comments || 0,
      shares: p.videoData?.shares || 0,
      favorites: p.videoData?.favorites || 0,
    }))
    .sort((a, b) => b.views - a.views);

  const totalViews = chartData.reduce((sum, d) => sum + d.views, 0);

  // Parse retention data for line chart
  const parseRetention = (raw: string | null) => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* ignore */ }
    const lines = raw.split("\n").filter(Boolean);
    return lines.map((line) => {
      const [time, pct] = line.split(/[,\t]/).map((s) => s.trim());
      return { time: time || "?", retention: parseFloat(pct) || 0 };
    });
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const retentionData = selectedProject?.videoData?.retentionData
    ? parseRetention(selectedProject.videoData.retentionData)
    : [];

  // Parse audience data
  const parseAudience = (raw: string | null) => {
    if (!raw) return { gender: [], age: [], region: [] };
    try {
      const parsed = JSON.parse(raw);
      return {
        gender: parsed.gender ? Object.entries(parsed.gender).map(([k, v]) => ({ name: k, value: v as number })) : [],
        age: parsed.age ? Object.entries(parsed.age).map(([k, v]) => ({ name: k, value: v as number })) : [],
        region: parsed.region ? Object.entries(parsed.region).map(([k, v]) => ({ name: k, value: v as number })) : [],
      };
    } catch { return { gender: [], age: [], region: [] }; }
  };
  const audience = selectedProject?.videoData?.audienceData
    ? parseAudience(selectedProject.videoData.audienceData)
    : { gender: [], age: [], region: [] };

  const GENDER_COLORS = ["#f43f5e", "#3b82f6", "#a855f7"];
  const AGE_COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];
  const REGION_COLORS = ["#0ea5e9", "#f97316", "#22c55e", "#f43f5e", "#a855f7", "#eab308"];

  if (loading) return <AnalyticsSkeleton />;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">数据分析</h1>

      <Tabs defaultValue="import">
        <TabsList className="flex-wrap">
          <TabsTrigger value="import">数据导入</TabsTrigger>
          <TabsTrigger value="charts">图表总览</TabsTrigger>
          <TabsTrigger value="retention">留存曲线</TabsTrigger>
          <TabsTrigger value="audience">观众画像</TabsTrigger>
          <TabsTrigger value="ai-review">AI 复盘</TabsTrigger>
        </TabsList>

        {/* ===== Import Tab ===== */}
        <TabsContent value="import" className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* B站 API */}
            <Card>
              <CardHeader><CardTitle className="text-base">B站 API 拉取</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">关联项目</Label>
                  <select className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
                    <option value="">选择项目...</option>
                    {projects.map((p) => (<option key={p.id} value={p.id}>{p.title || "未命名"}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">BV 号或链接</Label>
                  <div className="flex gap-2">
                    <Input placeholder="BV1xx..." value={bvid} onChange={(e) => setBvid(e.target.value)} className="h-9" />
                    <Button onClick={fetchBilibiliData} disabled={fetching} size="sm"><RefreshCw className={`h-3 w-3 mr-1 ${fetching ? "animate-spin" : ""}`} />拉取</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Manual */}
            <Card>
              <CardHeader><CardTitle className="text-base">手动录入</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {["views", "likes", "comments", "shares", "favorites", "coins"].map((k) => (
                    <div key={k} className="space-y-0.5">
                      <Label className="text-xs">{k === "views" ? "播放" : k === "likes" ? "点赞" : k === "comments" ? "评论" : k === "shares" ? "分享" : k === "favorites" ? "收藏" : "投币"}</Label>
                      <Input type="number" className="h-8 text-sm" value={(manualData as any)[k]} onChange={(e) => setManualData({ ...manualData, [k]: e.target.value })} />
                    </div>
                  ))}
                </div>
                <Button onClick={submitManualData} size="sm" className="w-full"><Plus className="h-3 w-3 mr-1" />保存</Button>
              </CardContent>
            </Card>

            {/* CSV Import */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />CSV 导入</CardTitle>
                <CardDescription>标题行: 播放量,点赞,评论,分享,收藏</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="h-3 w-3 mr-1" />选择文件</Button>
                  <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                </div>
                <Textarea placeholder="或直接粘贴 CSV 内容..." value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={4} className="text-xs" />
                <Button onClick={handleCsvImport} size="sm" className="w-full">导入 CSV</Button>
              </CardContent>
            </Card>
          </div>

          {/* Retention & Audience inputs */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">留存数据</CardTitle><CardDescription>格式：时间,留存率 每行一个</CardDescription></CardHeader>
              <CardContent>
                <Textarea placeholder="0:00,100%&#10;0:30,85%&#10;5:00,60%&#10;15:00,45%" value={retentionInput} onChange={(e) => setRetentionInput(e.target.value)} rows={5} className="text-xs" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">观众画像</CardTitle><CardDescription>JSON 格式: 性别/年龄/地区</CardDescription></CardHeader>
              <CardContent>
                <Textarea
                  placeholder='{"gender":{"男":65,"女":35},"age":{"18-24":40,"25-30":35,"31-40":20},"region":{"广东":15,"北京":12,"上海":10}}'
                  value={audienceInput} onChange={(e) => setAudienceInput(e.target.value)} rows={5} className="text-xs"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== Charts Tab ===== */}
        <TabsContent value="charts" className="mt-4">
          {chartData.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">还没有视频数据。先去「数据导入」添加数据。</CardContent></Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-base">播放量对比</CardTitle><CardDescription>总播放：{totalViews.toLocaleString()}</CardDescription></CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="views" name="播放量" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">互动分布</CardTitle></CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{ name: "点赞", value: chartData.reduce((s, d) => s + d.likes, 0) }, { name: "评论", value: chartData.reduce((s, d) => s + d.comments, 0) }, { name: "分享", value: chartData.reduce((s, d) => s + d.shares, 0) }, { name: "收藏", value: chartData.reduce((s, d) => s + d.favorites, 0) }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label={({ name, value }) => `${name}: ${value.toLocaleString()}`}>
                        {[0, 1, 2, 3].map((i) => (<Cell key={i} fill={["#ef4444", "#f59e0b", "#10b981", "#8b5cf6"][i]} />))}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">互动率对比</CardTitle></CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.map((d) => ({ ...d, likeRate: d.views > 0 ? +((d.likes / d.views) * 100).toFixed(2) : 0, favRate: d.views > 0 ? +((d.favorites / d.views) * 100).toFixed(2) : 0 }))}>
                      <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} unit="%" /><Tooltip />
                      <Bar dataKey="likeRate" name="点赞率 %" fill="#ef4444" radius={[4, 4, 0, 0]} /><Bar dataKey="favRate" name="收藏率 %" fill="#8b5cf6" radius={[4, 4, 0, 0]} /><Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ===== Retention Tab ===== */}
        <TabsContent value="retention" className="mt-4">
          {retentionData.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">还没有留存数据。选择项目后在「数据导入」中输入留存数据。</CardContent></Card>
          ) : (
            <Card>
              <CardHeader><CardTitle className="text-base">留存曲线 — {selectedProject?.title}</CardTitle></CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={retentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                    <Tooltip formatter={(v: any) => `${v}%`} />
                    <Line type="monotone" dataKey="retention" name="观众留存率" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== Audience Tab ===== */}
        <TabsContent value="audience" className="mt-4">
          {audience.gender.length === 0 && audience.age.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">还没有观众画像数据。选择项目后在「数据导入」中输入 JSON 格式数据。</CardContent></Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {audience.gender.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">性别分布</CardTitle></CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={audience.gender} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}%`}>
                          {audience.gender.map((_, i) => (<Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />))}
                        </Pie>
                        <Tooltip /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
              {audience.age.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">年龄分布</CardTitle></CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={audience.age} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}%`}>
                          {audience.age.map((_, i) => (<Cell key={i} fill={AGE_COLORS[i % AGE_COLORS.length]} />))}
                        </Pie>
                        <Tooltip /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
              {audience.region.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">地区分布</CardTitle></CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={audience.region} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}%`}>
                          {audience.region.map((_, i) => (<Cell key={i} fill={REGION_COLORS[i % REGION_COLORS.length]} />))}
                        </Pie>
                        <Tooltip /><Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* ===== AI Review Tab ===== */}
        <TabsContent value="ai-review" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-blue-500" />AI 数据复盘</CardTitle>
                <CardDescription>AI 分析留存曲线、互动质量和观众画像，给出改进建议</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">选择项目</Label>
                  <select className="flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
                    <option value="">选择项目...</option>
                    {projects.map((p) => (<option key={p.id} value={p.id}>{p.title || "未命名"}</option>))}
                  </select>
                </div>
                {selectedProject?.videoData && (
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>播放 {selectedProject.videoData.views?.toLocaleString()} · 点赞 {selectedProject.videoData.likes?.toLocaleString()} · 评论 {selectedProject.videoData.comments?.toLocaleString()}</p>
                    <p>收藏 {selectedProject.videoData.favorites?.toLocaleString()} · {selectedProject.videoData.retentionData ? "✓ 有留存数据" : "✗ 无留存数据"} · {selectedProject.videoData.audienceData ? "✓ 有观众画像" : "✗ 无观众画像"}</p>
                  </div>
                )}
                <Button onClick={handleAiReview} disabled={reviewing || !selectedProjectId || !selectedProject?.videoData} className="w-full">
                  {reviewing ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />分析中...</> : <><Sparkles className="h-4 w-4 mr-1" />开始 AI 复盘</>}
                </Button>
              </CardContent>
            </Card>

            <div>
              {aiReviewResult ? (
                <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />AI 复盘结果
                      {aiReviewScore !== null && (
                        <Badge className={aiReviewScore >= 70 ? "bg-green-500" : aiReviewScore >= 40 ? "bg-yellow-500" : "bg-red-500"}>{aiReviewScore}/100</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">{aiReviewResult}</div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    选择一个有数据的项目，点击「开始 AI 复盘」查看分析结果。
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
