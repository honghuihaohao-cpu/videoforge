import { db } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WORKFLOW_STEPS, getPhaseName } from "@/lib/workflow-engine";
import { CheckCircle2, Circle, Play, ChevronRight } from "lucide-react";
import type { WorkflowStep } from "@/lib/workflow-engine";

export const dynamic = "force-dynamic";

export default async function WorkflowPage() {
  const projects = await db.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { workflowSteps: true },
  });

  const activeProject = projects[0];

  // Group steps by phase
  const phases = ["prepare", "produce", "post"] as const;
  const grouped = phases.map((phase) => ({
    phase,
    name: getPhaseName(phase),
    steps: WORKFLOW_STEPS.filter((s) => s.phase === phase),
  }));

  function getStepStatus(
    step: WorkflowStep
  ): "pending" | "in_progress" | "passed" | "failed" {
    if (!activeProject) return "pending";
    const record = activeProject.workflowSteps.find(
      (s) => s.stepNumber === step.number
    );
    return (record?.status as "pending" | "in_progress" | "passed" | "failed") || "pending";
  }

  function statusIcon(status: string) {
    if (status === "passed") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === "in_progress") return <Play className="h-5 w-5 text-blue-500" />;
    return <Circle className="h-5 w-5 text-muted-foreground/40" />;
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
          工作流 — 10步从选题到复盘
        </h1>
        <p className="text-muted-foreground mt-1">
          每一关都有明确的质量闸门，不过关不进下一步。
        </p>
      </div>

      {!activeProject ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">
              还没有项目。创建一个项目来开始你的工作流。
            </p>
            <Link href="/projects/new">
              <Button>创建第一个项目</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active project indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            当前项目：
            <Link href={`/projects/${activeProject.id}`} className="font-medium text-foreground hover:underline">
              {activeProject.title || "未命名项目"}
            </Link>
          </div>

          {grouped.map(({ phase, name, steps }) => (
            <div key={phase}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Badge variant="secondary">{name}</Badge>
                <span className="text-sm text-muted-foreground font-normal">
                  第 {steps[0].number} - {steps[steps.length - 1].number} 步
                </span>
              </h2>
              <div className="grid gap-3">
                {steps.map((step) => {
                  const status = getStepStatus(step);
                  return (
                    <Link
                      key={step.number}
                      href={`/workflow/${step.number}?projectId=${activeProject.id}`}
                    >
                      <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                        <CardHeader className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {statusIcon(status)}
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm flex items-center gap-2">
                                第 {step.number} 步：{step.name}
                                {status === "in_progress" && (
                                  <Badge className="text-xs bg-blue-500">进行中</Badge>
                                )}
                                {status === "passed" && (
                                  <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                    已通过
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="text-xs mt-0.5">
                                {step.tagline}
                              </CardDescription>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
