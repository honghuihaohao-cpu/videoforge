"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListTodo,
  FolderOpen,
  BarChart3,
  Settings,
  GitCompare,
  Image,
  MessageCircle,
  Repeat,
  Network,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

const navItems = [
  { href: "/", label: "仪表盘", icon: LayoutDashboard },
  { href: "/workflow", label: "工作流", icon: ListTodo },
  { href: "/projects", label: "项目", icon: FolderOpen },
  { href: "/analytics", label: "数据分析", icon: BarChart3 },
  { href: "/compare", label: "对比", icon: GitCompare },
  { href: "/tools/coverjudge", label: "封面裁判", icon: Image },
  { href: "/tools/commentmine", label: "评论挖掘", icon: MessageCircle },
  { href: "/tools/reforge", label: "内容复刻", icon: Repeat },
  { href: "/tools/knowchain", label: "知识图谱", icon: Network },
  { href: "/settings", label: "设置", icon: Settings },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 lg:w-64 border-r bg-background flex flex-col">
      <div className="h-14 flex items-center gap-3 px-3 lg:px-4 border-b">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="hidden lg:inline font-semibold text-lg tracking-tight">
          CreatorKit
        </span>
      </div>

      <nav className="flex-1 py-3 px-2 lg:px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t space-y-1 py-1">
        <ThemeToggle />
        <UserMenu />
        <div className="p-3 hidden lg:block">
          <p className="text-xs text-muted-foreground">CreatorKit v2.0</p>
        </div>
      </div>
    </aside>
  );
}
