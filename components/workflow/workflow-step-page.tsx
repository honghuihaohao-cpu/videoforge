"use client";

import { useState } from "react";
import {
  WORKFLOW_STEPS,
  getPhaseName,
  calculateStepScore,
  type WorkflowStep,
} from "@/lib/workflow-engine";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  Circle,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  title: string;
  platform: string;
  status: string;
  description: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  workflowSteps?: any[];
};

type StepRecord = {
  id: string;
  stepNumber: number;
  status: string;
  inputData: string | null;
  aiFeedback: string | null;
  userNotes: string | null;
  passedAt: Date | string | null;
} | null;

interface Props {
  stepNumber: number;
  project: Project | null;
  stepRecord: StepRecord;
  allProjects: Project[];
}

export function WorkflowStepPage({ stepNumber, project, stepRecord, allProjects }: Props) {
  const router = useRouter();
  const step = WORKFLOW_STEPS.find((s) => s.number === stepNumber);
  const prevStep = WORKFLOW_STEPS.find((s) => s.number === stepNumber - 1);
  const nextStep = WORKFLOW_STEPS.find((s) => s.number === stepNumber + 1);

  const [selectedProjectId, setSelectedProjectId] = useState(project?.id || "");
  const [inputContent, setInputContent] = useState(stepRecord?.inputData || "");
  const [passedGates, setPassedGates] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(stepRecord?.aiFeedback || null);
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!step) return <div className="p-8">步骤不存在</div>;

  const phaseName = getPhaseName(step.phase);
  const gateScore = calculateStepScore(step.qualityGates, passedGates);
  const isGatePassed = step.qualityGates.length === 0
    ? true
    : gateScore >= 80;

  async function handleSave() {
    if (!selectedProjectId) {
      toast.error("请先选择一个项目");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/projects/steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          stepNumber,
          stepName: step!.name,
          status: isGatePassed ? "passed" : "in_progress",
          inputData: inputContent,
          aiFeedback: aiResult,
        }),
      });
      if (!res.ok) throw new Error("保存失败");
      toast.success("已保存");
      router.refresh();
    } catch {
      toast.error("保存失败");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAnalyze() {
    if (!inputContent.trim()) {
      toast.error("请先输入内容再分析");
      return;
    }
    if (!step!.aiEvaluationEnabled) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: inputContent,
          stepName: step!.name,
          prompt: step!.aiPrompt,
        }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setAiResult(data.content);
      setAiScore(data.score);
      toast.success(`AI 评估完成，综合评分：${data.score}/100`);
    } catch {
      toast.error("AI 分析失败，请检查 API Key 配置");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/workflow" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{phaseName}</Badge>
              <Badge>第 {step.number} 步</Badge>
            </div>
            <h1 className="text-2xl font-bold mt-1">{step.name}</h1>
            <p className="text-muted-foreground">{step.tagline}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          {prevStep && (
            <Link href={`/workflow/${prevStep.number}?projectId=${selectedProjectId}`}>
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" /> 上一步
              </Button>
            </Link>
          )}
          {nextStep && (
            <Link href={`/workflow/${nextStep.number}?projectId=${selectedProjectId}`}>
              <Button variant="outline" size="sm">
                下一步 <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Guide + Input */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">选择项目</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedProjectId} onValueChange={(v) => v && setSelectedProjectId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择一个项目..." />
                </SelectTrigger>
                <SelectContent>
                  {allProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title || "未命名项目"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">操作指南</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
          </Card>

          {/* Input area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{step.inputLabel}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={step.inputPlaceholder}
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                rows={10}
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>

          {/* AI Result */}
          {aiResult && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  AI 评估结果
                  {aiScore !== null && (
                    <Badge className={aiScore >= 70 ? "bg-green-500" : aiScore >= 40 ? "bg-yellow-500" : "bg-red-500"}>
                      {aiScore}/100
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm">
                  {aiResult}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar: Quality Gates + Actions */}
        <div className="space-y-4">
          {/* Quality Gates */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">质量闸门</CardTitle>
              <CardDescription>
                完成度：{gateScore}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={gateScore} className="mb-4" />
              <div className="space-y-3">
                {step.qualityGates.map((gate) => (
                  <div key={gate.id} className="flex items-start gap-2">
                    <Checkbox
                      id={gate.id}
                      checked={passedGates.has(gate.id)}
                      onCheckedChange={(checked) => {
                        const next = new Set(passedGates);
                        if (checked) next.add(gate.id);
                        else next.delete(gate.id);
                        setPassedGates(next);
                      }}
                    />
                    <div>
                      <Label htmlFor={gate.id} className="text-sm cursor-pointer">
                        {gate.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{gate.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {step.qualityGates.length === 0 && (
                <p className="text-sm text-muted-foreground">此步无质量闸门，按自己的节奏完成即可。</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !selectedProjectId}
              >
                <Send className="h-4 w-4 mr-1" />
                {isSaving ? "保存中..." : "保存进度"}
              </Button>

              {step.aiEvaluationEnabled && (
                <Button
                  variant="secondary"
                  className="w-full"
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !inputContent.trim()}
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  AI 分析
                </Button>
              )}

              {(stepRecord?.status === "passed" || isGatePassed) && (
                <div className="flex items-center gap-2 pt-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  质量闸门已通过
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {stepRecord?.status === "passed" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : stepRecord?.status === "in_progress" ? (
                    <Circle className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>
                    状态：
                    {stepRecord?.status === "passed"
                      ? "已通过"
                      : stepRecord?.status === "in_progress"
                      ? "进行中"
                      : "未开始"}
                  </span>
                </div>
                {stepRecord?.passedAt && (
                  <p className="text-xs text-muted-foreground">
                    通过时间：{new Date(stepRecord.passedAt).toLocaleDateString("zh-CN")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
