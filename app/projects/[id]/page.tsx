import { db } from "@/lib/db";
import { notFound } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, Eye, Heart, MessageCircle, Share2, Star } from "lucide-react";

export const dynamic = "force-dynamic";

const platformNames: Record<string, string> = {
  bilibili: "B站", douyin: "抖音", wechat: "视频号",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    include: {
      workflowSteps: { orderBy: { stepNumber: "asc" } },
      analyses: { orderBy: { createdAt: "desc" } },
      videoData: true,
      improvements: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!project) notFound();

  const passedSteps = project.workflowSteps.filter((s) => s.status === "passed").length;
  const progressPct = Math.round((passedSteps / 10) * 100);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <Link href="/projects" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary">{platformNames[project.platform] || project.platform}</Badge>
            <Badge variant="outline">{project.status}</Badge>
          </div>
          <h1 className="text-2xl font-bold">{project.title || "未命名项目"}</h1>
        </div>
      </div>

      <Tabs defaultValue="steps">
        <TabsList>
          <TabsTrigger value="steps">工作流步骤</TabsTrigger>
          <TabsTrigger value="data">视频数据</TabsTrigger>
          <TabsTrigger value="analysis">AI 分析记录</TabsTrigger>
          <TabsTrigger value="improvements">改进建议</TabsTrigger>
        </TabsList>

        {/* Steps tab */}
        <TabsContent value="steps" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <Progress value={progressPct} className="flex-1" />
            <span className="text-sm font-medium">{passedSteps}/10</span>
          </div>

          <div className="grid gap-3">
            {project.workflowSteps.map((step) => (
              <Link
                key={step.id}
                href={`/workflow/${step.stepNumber}?projectId=${project.id}`}
              >
                <Card className="hover:shadow-sm transition-shadow">
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm">
                          第 {step.stepNumber} 步：{step.stepName}
                        </CardTitle>
                        {step.userNotes && (
                          <CardDescription className="text-xs mt-0.5 line-clamp-1">
                            {step.userNotes}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          step.status === "passed" ? "default" :
                          step.status === "in_progress" ? "secondary" : "outline"
                        }>
                          {step.status === "passed" ? "已通过" :
                           step.status === "in_progress" ? "进行中" :
                           step.status === "failed" ? "未通过" : "未开始"}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
            {project.workflowSteps.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">还没有开始任何步骤</p>
                  <Link href={`/workflow/1?projectId=${project.id}`}>
                    <Button>从第一步开始</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Data tab */}
        <TabsContent value="data" className="space-y-4 mt-4">
          {project.videoData ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StatCard icon={<Eye className="h-4 w-4" />} label="播放量" value={project.videoData.views.toLocaleString()} />
              <StatCard icon={<Heart className="h-4 w-4" />} label="点赞" value={project.videoData.likes.toLocaleString()} />
              <StatCard icon={<MessageCircle className="h-4 w-4" />} label="评论" value={project.videoData.comments.toLocaleString()} />
              <StatCard icon={<Share2 className="h-4 w-4" />} label="分享" value={project.videoData.shares.toLocaleString()} />
              <StatCard icon={<Star className="h-4 w-4" />} label="收藏" value={project.videoData.favorites.toLocaleString()} />
              {project.platform === "bilibili" && (
                <StatCard icon={<Star className="h-4 w-4" />} label="投币" value={project.videoData.coins.toLocaleString()} />
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">还没有视频数据。发布视频后回来录入或拉取数据。</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analysis tab */}
        <TabsContent value="analysis" className="space-y-4 mt-4">
          {project.analyses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                还没有 AI 分析记录。在工作流中使用 AI 分析功能来生成评估。
              </CardContent>
            </Card>
          ) : (
            project.analyses.map((a) => (
              <Card key={a.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{a.type === "script" ? "脚本分析" : a.type === "video" ? "视频分析" : "数据复盘"}</CardTitle>
                    <div className="flex items-center gap-2">
                      {a.score != null && <Badge>{a.score}/100</Badge>}
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
                    {a.content}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Improvements tab */}
        <TabsContent value="improvements" className="space-y-4 mt-4">
          {project.improvements.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                还没有改进建议。AI 在分析脚本和数据时会自动生成改进建议。
              </CardContent>
            </Card>
          ) : (
            project.improvements.map((imp) => (
              <Card key={imp.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{imp.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(imp.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{imp.suggestion}</p>
                  {imp.wasHelpful !== null && (
                    <Badge variant={imp.wasHelpful ? "default" : "destructive"} className="mt-2 text-xs">
                      {imp.wasHelpful ? "有帮助" : "无帮助"}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
