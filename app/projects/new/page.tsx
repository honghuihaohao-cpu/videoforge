"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("bilibili");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { toast.error("请输入项目名称"); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), platform, description: description.trim() }),
      });
      if (!res.ok) throw new Error("创建失败");
      const data = await res.json();
      toast.success("项目已创建");
      router.push(`/projects/${data.id}`);
    } catch {
      toast.error("创建失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/projects" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">创建新项目</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>项目信息</CardTitle>
            <CardDescription>填写视频项目的基本信息，后续在工作流中逐步完善。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">项目名称 *</Label>
              <Input
                id="title"
                placeholder="例如：Harness Engineering 深度科普"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">目标平台</Label>
              <Select value={platform} onValueChange={(v) => v && setPlatform(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bilibili">B站（Bilibili）</SelectItem>
                  <SelectItem value="douyin">抖音</SelectItem>
                  <SelectItem value="wechat">视频号</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">项目描述</Label>
              <Textarea
                id="desc"
                placeholder="简述选题方向、预期受众、目标时长..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "创建中..." : "创建项目"}
              </Button>
              <Link href="/projects">
                <Button variant="outline" type="button">取消</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
