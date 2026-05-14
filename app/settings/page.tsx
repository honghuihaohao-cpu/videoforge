"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Key, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<"unknown" | "valid" | "invalid">("unknown");

  async function handleSaveKey() {
    if (!apiKey.trim()) return;
    setChecking(true);
    setStatus("unknown");
    try {
      const res = await fetch("/api/analyze/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "测试内容",
          stepName: "测试",
          prompt: "请用'API连接正常'回复。",
          apiKey: apiKey.trim(),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setStatus("invalid");
        toast.error("API Key 无效：" + data.error);
      } else {
        setStatus("valid");
        toast.success("API Key 验证通过！请将 Key 设置到环境变量 ANTHROPIC_API_KEY");
      }
    } catch {
      setStatus("invalid");
      toast.error("连接失败，请检查 Key");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">设置</h1>
        <p className="text-muted-foreground mt-1">配置 API Key 和应用参数。</p>
      </div>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Anthropic API Key
          </CardTitle>
          <CardDescription>
            VideoForge 使用 Claude API 进行 AI 脚本分析、内容评估和数据复盘。
            获取 Key：<a href="https://console.anthropic.com/" target="_blank" className="text-primary hover:underline">console.anthropic.com</a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              生产环境中请将 Key 设置到 <code>.env</code> 文件的 <code>ANTHROPIC_API_KEY</code> 变量中。
              此处的 Key 仅用于临时测试验证。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSaveKey} disabled={checking || !apiKey.trim()}>
              {checking ? "验证中..." : "验证并测试"}
            </Button>
            {status === "valid" && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" /> 有效
              </Badge>
            )}
            {status === "invalid" && (
              <Badge variant="destructive">无效</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">关于 VideoForge</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>版本：v0.1.0</p>
          <p>开源协议：MIT</p>
          <p>技术栈：Next.js + Prisma + SQLite + Claude API + shadcn/ui + Recharts</p>
          <p>
            GitHub：{" "}
            <a href="https://github.com/honghuihaohao-cpu/videoforge" className="text-primary hover:underline" target="_blank">
              github.com/honghuihaohao-cpu/videoforge
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
