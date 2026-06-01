"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userName?: string;
  onClose?: () => void;
}

const navLinks = [
  {
    href: "/notes",
    label: "我的笔记",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/community",
    label: "社区",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
];

export default function Sidebar({ userName, onClose }: SidebarProps) {
  const pathname = usePathname();

  const handleNav = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="w-56 h-screen border-r border-border bg-stone-50 flex flex-col">
      {/* 品牌区 */}
      <div className="p-4 flex items-center justify-between shrink-0">
        <Link
          href="/notes"
          className="flex items-center gap-2 text-base font-bold text-foreground hover:text-primary transition-colors"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground text-sm">
            🧠
          </span>
          成长第二大脑
        </Link>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={onClose}
            aria-label="关闭菜单"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        )}
      </div>

      <Separator className="mx-4 w-auto" />

      {/* 导航 */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleNav}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/60"
                )}
              >
                {/* 左侧激活指示条 */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 rounded-r-full" />
                )}
                <span className={cn(
                  "transition-colors",
                  active ? "text-emerald-600" : "text-stone-400 group-hover:text-stone-500"
                )}>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* 用户区 */}
      {userName && (
        <div className="shrink-0 p-3 border-t border-border">
          <div className="flex items-center gap-2.5 mb-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-medium">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-foreground font-medium truncate flex-1">
              {userName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground hover:text-destructive"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <svg className="h-3.5 w-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            退出登录
          </Button>
        </div>
      )}
    </aside>
  );
}
