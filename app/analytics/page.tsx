"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { RefreshCw, Plus } from "lucide-react";

const PLATFORM_COLORS = { bilibili: "#00a1d6", douyin: "#ff0044", wechat: "#07c160" };

export default function AnalyticsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bvid, setBvid] = useState("");
  const [fetching, setFetching] = useState(false);
  const [manualData, setManualData] = useState({
    views: "", likes: "", comments: "", shares: "", favorites: "", coins: "",
  });
  const [selectedProjectId, setSelectedProjectId] = useState("");

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
          ...Object.fromEntries(
            Object.entries(manualData).map(([k, v]) => [k, parseInt(v) || 0])
          ),
        }),
      });
      if (res.ok) { toast.success("数据已保存"); loadData(); } else toast.error("保存失败");
    } catch { toast.error("保存失败"); }
  }

  // Prepare chart data
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

  if (loading) return <div className="p-8 text-muted-foreground">加载中...</div>;

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">数据分析</h1>

      {/* Data import */}
      <Tabs defaultValue="bilibili">
        <TabsList>
          <TabsTrigger value="bilibili">B站 API 拉取</TabsTrigger>
          <TabsTrigger value="manual">手动录入</TabsTrigger>
        </TabsList>

        <TabsContent value="bilibili" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">从 B 站拉取视频数据</CardTitle>
              <CardDescription>输入视频 BV 号或链接，自动获取公开数据（播放量、点赞、投币等）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>关联项目</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">选择项目...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title || "未命名"}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>B站视频链接或 BV 号</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://www.bilibili.com/video/BV1xx... 或 BV1xx..."
                    value={bvid}
                    onChange={(e) => setBvid(e.target.value)}
                  />
                  <Button onClick={fetchBilibiliData} disabled={fetching}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${fetching ? "animate-spin" : ""}`} />
                    拉取
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">手动录入数据</CardTitle>
              <CardDescription>从抖音创作者后台或视频号数据中心复制数据</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>关联项目</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">选择项目...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title || "未命名"}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["views", "likes", "comments", "shares", "favorites", "coins"].map((key) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">
                      {key === "views" ? "播放量" : key === "likes" ? "点赞" : key === "comments" ? "评论" : key === "shares" ? "分享" : key === "favorites" ? "收藏" : "投币"}
                    </Label>
                    <Input
                      type="number"
                      value={(manualData as any)[key]}
                      onChange={(e) => setManualData({ ...manualData, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <Button onClick={submitManualData} className="mt-3">
                <Plus className="h-4 w-4 mr-1" />保存数据
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Views bar chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">视频播放量对比</CardTitle>
              <CardDescription>总播放：{totalViews.toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="views" name="播放量" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement pie chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">互动分布</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "点赞", value: chartData.reduce((s, d) => s + d.likes, 0), color: "#ef4444" },
                      { name: "评论", value: chartData.reduce((s, d) => s + d.comments, 0), color: "#f59e0b" },
                      { name: "分享", value: chartData.reduce((s, d) => s + d.shares, 0), color: "#10b981" },
                      { name: "收藏", value: chartData.reduce((s, d) => s + d.favorites, 0), color: "#8b5cf6" },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ name, value }) => `${name}: ${value.toLocaleString()}`}
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <Cell key={i} fill={["#ef4444", "#f59e0b", "#10b981", "#8b5cf6"][i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engagement rate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">互动率对比（点赞率/收藏率）</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.map((d) => ({
                  ...d,
                  likeRate: d.views > 0 ? ((d.likes / d.views) * 100).toFixed(2) : 0,
                  favRate: d.views > 0 ? ((d.favorites / d.views) * 100).toFixed(2) : 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="%" />
                  <Tooltip />
                  <Bar dataKey="likeRate" name="点赞率 %" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="favRate" name="收藏率 %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {chartData.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            还没有视频数据。拉取 B 站数据或手动录入手动添加。
          </CardContent>
        </Card>
      )}
    </div>
  );
}
