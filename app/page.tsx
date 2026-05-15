import { db } from "@/lib/db";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FolderOpen, CheckCircle2, Clock, Plus, Image, MessageCircle, Repeat, Network, Pencil, Target, Activity, Wand2, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WelcomeCard } from "@/components/layout/onboarding";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await db.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: {
      workflowSteps: { select: { status: true } },
      videoData: { select: { views: true } },
    },
  });

  const totalProjects = await db.project.count();
  const publishedProjects = await db.project.count({ where: { status: "published" } });
  const inProgressProjects = await db.project.count({
    where: { status: { in: ["planning", "scripting", "producing"] } },
  });

  const stats = [
    { label: "总项目", value: totalProjects, icon: FolderOpen },
    { label: "制作中", value: inProgressProjects, icon: Clock },
    { label: "已发布", value: publishedProjects, icon: CheckCircle2 },
  ];

  const platformName = (p: string) =>
    p === "bilibili" ? "B站" : p === "douyin" ? "抖音" : "视频号";

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div>
        <div className="rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 dark:from-zinc-800 dark:via-zinc-900 dark:to-black p-6 lg:p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20"><Zap className="h-5 w-5" /></div>
            <span className="text-xs text-zinc-400 tracking-wide">CREATOR KIT v2.0</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">创作者工具箱</h1>
          <p className="text-zinc-400 mt-2 max-w-xl">5 合 1 超级应用 — 从选题策划到数据复盘，从封面 CTR 预测到跨平台内容复刻，一个人的视频制作团队。</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tool quick links */}
      <div>
        <h2 className="text-lg font-semibold mb-3">工具箱</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/workflow", icon: Zap, label: "VideoForge", desc: "10步工作流 + AI 分析 + 数据复盘", color: "text-amber-500 bg-amber-50 dark:bg-amber-950" },
            { href: "/tools/coverjudge", icon: Image, label: "CoverJudge", desc: "AI 封面 CTR 三平台预测", color: "text-blue-500 bg-blue-50 dark:bg-blue-950" },
            { href: "/tools/commentmine", icon: MessageCircle, label: "CommentMine", desc: "B站评论挖掘 + 选题生成", color: "text-green-500 bg-green-50 dark:bg-green-950" },
            { href: "/tools/reforge", icon: Repeat, label: "Reforge", desc: "长脚本 → 5种平台格式", color: "text-purple-500 bg-purple-50 dark:bg-purple-950" },
            { href: "/tools/knowchain", icon: Network, label: "KnowChain", desc: "知识图谱 + 选题推荐", color: "text-rose-500 bg-rose-50 dark:bg-rose-950" },
            { href: "/tools/titleforge", icon: Pencil, label: "TitleForge", desc: "AI 标题生成 + CTR预测", color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950" },
            { href: "/tools/hooklab", icon: Target, label: "HookLab", desc: "5种钩子风格 + 留存预测", color: "text-orange-500 bg-orange-50 dark:bg-orange-950" },
            { href: "/tools/scriptdoctor", icon: Activity, label: "ScriptDoctor", desc: "节奏·逻辑·密度诊断", color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950" },
            { href: "/tools/subtitlefix", icon: Wand2, label: "SubtitleFix", desc: "字幕错字修正 + 断句优化", color: "text-teal-500 bg-teal-50 dark:bg-teal-950" },
            { href: "/tools/trendradar", icon: Flame, label: "TrendRadar", desc: "AI 热点趋势扫描", color: "text-red-500 bg-red-50 dark:bg-red-950" },
          ].map((t) => (
            <Link key={t.href} href={t.href}>
              <Card className="hover:shadow-md transition-shadow h-full cursor-pointer">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${t.color}`}><t.icon className="h-5 w-5" /></div>
                  <div><CardTitle className="text-sm">{t.label}</CardTitle><CardDescription className="text-xs mt-0.5">{t.desc}</CardDescription></div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/projects/new">
          <Button><Plus className="h-4 w-4 mr-1" />创建新项目</Button>
        </Link>
        <Link href="/workflow">
          <Button variant="outline">查看工作流</Button>
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">最近项目</h2>
          <Link href="/projects" className="text-sm text-primary hover:underline flex items-center gap-1">
            查看全部 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <WelcomeCard />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => {
              const completedSteps = p.workflowSteps.filter((s) => s.status === "passed").length;
              return (
                <Link key={p.id} href={`/projects/${p.id}`}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-2">{p.title || "未命名项目"}</CardTitle>
                        <Badge variant="outline" className="shrink-0 text-xs">{platformName(p.platform)}</Badge>
                      </div>
                      <CardDescription>
                        进度：{completedSteps}/10 步
                        {p.videoData?.views ? ` · ${p.videoData.views.toLocaleString()} 播放` : ""}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
