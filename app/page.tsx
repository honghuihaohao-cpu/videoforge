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
import { ArrowRight, FolderOpen, CheckCircle2, Clock, Plus, Image, MessageCircle, Repeat, Network, Zap } from "lucide-react";
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
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">CreatorKit</h1>
        <p className="text-muted-foreground mt-1">
          创作者工具箱 — 5 合 1 超级应用
        </p>
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
