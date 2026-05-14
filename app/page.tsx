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
import { ArrowRight, FolderOpen, CheckCircle2, Clock, Plus } from "lucide-react";
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
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-muted-foreground mt-1">
          管理你的视频项目，追踪每一步进展。
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
