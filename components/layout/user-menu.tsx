"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import Link from "next/link";

export function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <Link href="/login" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground w-full">
        <User className="h-5 w-5 shrink-0" />
        <span className="hidden lg:inline">登录</span>
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 w-full">
      <Avatar className="h-5 w-5 shrink-0">
        <AvatarFallback className="text-xs">{session.user.name?.charAt(0) || "U"}</AvatarFallback>
      </Avatar>
      <span className="hidden lg:inline text-sm font-medium truncate flex-1">{session.user.name}</span>
      <Button variant="ghost" size="sm" className="h-7 px-1" onClick={() => signOut()}>
        <LogOut className="h-3 w-3" />
      </Button>
    </div>
  );
}
