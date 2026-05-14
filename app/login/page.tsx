"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Zap, Terminal } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDemoLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) { toast.error("输入 demo 即可登录"); return; }
    setLoading(true);
    const result = await signIn("credentials", { username: username.trim(), redirect: false });
    setLoading(false);
    if (result?.ok) {
      toast.success("登录成功");
      router.push("/");
      router.refresh();
    } else {
      toast.error("登录失败，输入 demo 试试");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-xl">登录 VideoForge</CardTitle>
          <CardDescription>使用 GitHub 账号或 Demo 模式登录</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("github", { callbackUrl: "/" })}
          >
            <Terminal className="h-4 w-4 mr-2" />
            使用 GitHub 登录
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">或 Demo 模式</span></div>
          </div>

          <form onSubmit={handleDemoLogin} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">用户名</Label>
              <Input placeholder="输入 demo" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登录中..." : "Demo 登录"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
