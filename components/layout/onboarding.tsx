import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ListTodo, Sparkles, BarChart3, ArrowRight } from "lucide-react";

export function WelcomeCard() {
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-xl">欢迎使用 VideoForge</CardTitle>
        <CardDescription>
          你的 AI 视频创作工作流助手。三步开始你的第一条高质量视频。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/projects/new" className="group">
            <div className="rounded-lg border bg-card p-4 h-full transition-all hover:shadow-md hover:border-primary/50">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="text-xs bg-primary">第 1 步</Badge>
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">创建项目</h3>
              <p className="text-xs text-muted-foreground">
                设定选题方向、目标平台，建立你的第一个视频项目。
              </p>
              <span className="text-xs text-primary mt-2 inline-flex items-center gap-1 group-hover:underline">
                开始 <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>

          <Link href="/workflow" className="group">
            <div className="rounded-lg border bg-card p-4 h-full transition-all hover:shadow-md hover:border-primary/50">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="text-xs bg-primary">第 2 步</Badge>
                <ListTodo className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">走工作流</h3>
              <p className="text-xs text-muted-foreground">
                按 10 步标准化流程推进，每步都有质量闸门和 AI 评估。
              </p>
              <span className="text-xs text-primary mt-2 inline-flex items-center gap-1 group-hover:underline">
                查看 <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>

          <Link href="/analytics" className="group">
            <div className="rounded-lg border bg-card p-4 h-full transition-all hover:shadow-md hover:border-primary/50">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="text-xs bg-muted text-muted-foreground">第 3 步</Badge>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">发布 & 复盘</h3>
              <p className="text-xs text-muted-foreground">
                拉取平台数据，用 AI 分析留存曲线和互动，形成改进清单。
              </p>
              <span className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1">
                发布后可用
              </span>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action: { label: string; href: string };
}) {
  return (
    <Card>
      <CardContent className="py-12 text-center space-y-4">
        <Icon className="h-12 w-12 mx-auto text-muted-foreground/40" />
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <Link href={action.href}>
          <Button>{action.label}</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
