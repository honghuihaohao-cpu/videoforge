"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface Improvement {
  id: string;
  category: string;
  suggestion: string;
  wasHelpful: boolean | null;
  createdAt: Date | string;
}

export function ImprovementList({ improvements: initial }: { improvements: Improvement[] }) {
  const [items, setItems] = useState(initial);

  async function handleFeedback(id: string, wasHelpful: boolean) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, wasHelpful } : i)));
    try {
      const res = await fetch("/api/projects/improvements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, wasHelpful }),
      });
      if (!res.ok) throw new Error();
      toast.success(wasHelpful ? "已标记为有帮助" : "已标记为无帮助");
    } catch {
      toast.error("反馈失败");
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, wasHelpful: null } : i)));
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          还没有改进建议。在工作流中使用 AI 分析功能后，AI 会自动提取改进建议。
        </CardContent>
      </Card>
    );
  }

  const helpfulCount = items.filter((i) => i.wasHelpful === true).length;
  const unhelpfulCount = items.filter((i) => i.wasHelpful === false).length;

  return (
    <div className="space-y-3">
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span>共 {items.length} 条建议</span>
        <span className="text-green-600">{helpfulCount} 条有帮助</span>
        {unhelpfulCount > 0 && <span className="text-red-500">{unhelpfulCount} 条无帮助</span>}
      </div>

      {items.map((imp) => (
        <Card key={imp.id} className={imp.wasHelpful === true ? "border-green-200 bg-green-50/30" : imp.wasHelpful === false ? "border-red-200 bg-red-50/30 opacity-60" : ""}>
          <CardHeader className="py-2 px-4">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="text-xs shrink-0">{imp.category}</Badge>
              <div className="flex items-center gap-1">
                {imp.wasHelpful === null ? (
                  <>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleFeedback(imp.id, true)}>
                      <ThumbsUp className="h-3 w-3 mr-1" />有帮助
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleFeedback(imp.id, false)}>
                      <ThumbsDown className="h-3 w-3 mr-1" />无帮助
                    </Button>
                  </>
                ) : (
                  <Badge variant={imp.wasHelpful ? "default" : "destructive"} className="text-xs">
                    {imp.wasHelpful ? "✓ 有帮助" : "✗ 无帮助"}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="py-1 px-4">
            <p className="text-sm">{imp.suggestion}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
