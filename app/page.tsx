import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WelcomeCard } from "@/components/layout/onboarding";
import { ArrowRight, FolderOpen, CheckCircle2, Clock, Plus, Image, MessageCircle, Repeat, Network, Pencil, Target, Activity, Wand2, Flame, Hash, Zap, TrendingUp, Sparkles, Lightbulb } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await db.project.findMany({
    orderBy: { updatedAt: "desc" }, take: 3,
    include: { workflowSteps: { select: { status: true } }, videoData: { select: { views: true } } },
  });
  const total = await db.project.count();
  const published = await db.project.count({ where: { status: "published" } });
  const active = await db.project.count({ where: { status: { in: ["planning", "scripting", "producing"] } } });

  const toolCategories = [
    {
      name: "策划期", icon: Lightbulb, desc: "从选题到脚本",
      tools: [
        { href: "/tools/ideaforge", icon: Lightbulb, label: "IdeaForge", desc: "AI 创意孵化器", color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400" },
        { href: "/tools/trendradar", icon: Flame, label: "TrendRadar", desc: "热点趋势扫描", color: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400" },
        { href: "/tools/knowchain", icon: Network, label: "KnowChain", desc: "知识图谱", color: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400" },
        { href: "/tools/titleforge", icon: Pencil, label: "TitleForge", desc: "标题生成", color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400" },
        { href: "/tools/hooklab", icon: Target, label: "HookLab", desc: "钩子工坊", color: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400" },
      ],
    },
    {
      name: "制作期", icon: Sparkles, desc: "从封面到剪辑",
      tools: [
        { href: "/tools/coverjudge", icon: Image, label: "CoverJudge", desc: "封面CTR预测", color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
        { href: "/tools/scriptdoctor", icon: Activity, label: "ScriptDoctor", desc: "脚本诊断", color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" },
        { href: "/tools/subtitlefix", icon: Wand2, label: "SubtitleFix", desc: "字幕修正", color: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400" },
        { href: "/tools/reforge", icon: Repeat, label: "Reforge", desc: "跨平台复刻", color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400" },
      ],
    },
    {
      name: "发布期", icon: TrendingUp, desc: "从发布到复盘",
      tools: [
        { href: "/workflow", icon: Zap, label: "VideoForge", desc: "10步工作流", color: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
        { href: "/tools/commentmine", icon: MessageCircle, label: "CommentMine", desc: "评论挖掘", color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" },
        { href: "/tools/pacingcalc", icon: Clock, label: "PacingCalc", desc: "时长计算", color: "bg-lime-50 text-lime-600 dark:bg-lime-950 dark:text-lime-400" },
        { href: "/tools/seodesc", icon: Hash, label: "SEODesc", desc: "SEO描述", color: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400" },
      ],
    },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 p-6 lg:p-10 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"><Zap className="h-6 w-6" /></div>
            <div>
              <span className="text-xs text-zinc-400 tracking-widest uppercase">Creator Kit</span>
              <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mt-1">创作者工具箱</h1>
            </div>
          </div>
          <p className="text-zinc-400 max-w-2xl text-sm lg:text-base">10 个 AI 驱动的创作工具，覆盖从选题策划到数据复盘的全流程。一个人的视频制作团队。</p>
          <div className="flex gap-3 mt-5 flex-wrap">
            <Link href="/projects/new"><Button size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100"><Plus className="h-4 w-4 mr-1" />开始新项目</Button></Link>
            <Link href="/workflow"><Button variant="outline" size="lg" className="border-zinc-700 text-zinc-200 hover:bg-white/10">探索工作流</Button></Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "总项目", value: total, sub: "个视频项目", icon: FolderOpen },
          { label: "制作中", value: active, sub: "正在进行", icon: Clock },
          { label: "已发布", value: published, sub: "已上线", icon: CheckCircle2 },
          { label: "工具箱", value: 10, sub: "AI 工具可用", icon: Sparkles },
        ].map((s) => (
          <Card key={s.label} className="border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tool categories */}
      <div className="space-y-6">
        {toolCategories.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center gap-2 mb-3">
              <cat.icon className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">{cat.name}</h2>
              <span className="text-xs text-muted-foreground">{cat.desc}</span>
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {cat.tools.map((t) => (
                <Link key={t.href} href={t.href}>
                  <Card className="hover:shadow-md hover:border-primary/30 transition-all h-full cursor-pointer group">
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.color}`}><t.icon className="h-5 w-5" /></div>
                      <div>
                        <CardTitle className="text-sm group-hover:text-primary transition-colors">{t.label}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">{t.desc}</CardDescription>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">最近项目</h2>
          <Link href="/projects" className="text-sm text-primary hover:underline flex items-center gap-1">全部 <ArrowRight className="h-3 w-3" /></Link>
        </div>
        {projects.length === 0 ? (
          <WelcomeCard />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => {
              const passed = p.workflowSteps.filter((s) => s.status === "passed").length;
              const pName = (p: string) => p === "bilibili" ? "B站" : p === "douyin" ? "抖音" : "视频号";
              return (
                <Link key={p.id} href={`/projects/${p.id}`}>
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base line-clamp-2">{p.title || "未命名"}</CardTitle>
                        <Badge variant="outline" className="shrink-0 text-xs">{pName(p.platform)}</Badge>
                      </div>
                      <CardDescription>进度 {passed}/10{p.videoData?.views ? ` · ${p.videoData.views.toLocaleString()} 播放` : ""}</CardDescription>
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
