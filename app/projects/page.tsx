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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, FolderOpen } from "lucide-react";

export const dynamic = "force-dynamic";

const platformNames: Record<string, string> = {
  bilibili: "B站",
  douyin: "抖音",
  wechat: "视频号",
};

const statusNames: Record<string, string> = {
  planning: "规划中",
  scripting: "脚本撰写",
  producing: "制作中",
  published: "已发布",
  archived: "已归档",
};

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      workflowSteps: { select: { status: true } },
      videoData: { select: { views: true } },
    },
  });

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">项目</h1>
          <p className="text-muted-foreground mt-1">管理你的所有视频项目。</p>
        </div>
        <Link href="/projects/new">
          <Button><Plus className="h-4 w-4 mr-1" />新项目</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground">还没有项目。创建第一个项目来开始吧。</p>
            <Link href="/projects/new"><Button>创建项目</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const passed = p.workflowSteps.filter((s) => s.status === "passed").length;
            const progressPct = Math.round((passed / 10) * 100);
            return (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {platformNames[p.platform] || p.platform}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {statusNames[p.status] || p.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-2">
                      {p.title || "未命名项目"}
                    </CardTitle>
                    {p.description && (
                      <CardDescription className="line-clamp-2 text-xs">
                        {p.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>进度：{passed}/10 步</span>
                        <span>{progressPct}%</span>
                      </div>
                      <Progress value={progressPct} />
                      {p.videoData?.views != null && p.videoData.views > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {p.videoData.views.toLocaleString()} 次播放
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
