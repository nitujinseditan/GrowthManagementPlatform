"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import QuickSwitcher from "@/components/ui/QuickSwitcher";

interface DashboardShellProps {
  userName?: string;
  children: React.ReactNode;
}

export default function DashboardShell({
  userName,
  children,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const pathname = usePathname();

  // 切换路由时自动关闭移动端侧边栏
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Ctrl+P 快速切换器
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        setSwitcherOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // 移动端底部 Tab 栏配置
  const mobileTabs = [
    {
      href: "/notes",
      label: "笔记",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      active: pathname.startsWith("/notes"),
    },
    {
      href: "/community",
      label: "社区",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      active: pathname.startsWith("/community"),
    },
  ];

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-stone-50">
        {/* 桌面端侧边栏 */}
        <div className="hidden md:block shrink-0">
        <Sidebar userName={userName} />
      </div>

      {/* 移动端侧边栏 — 抽屉 + 遮罩 */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 z-50 md:hidden shadow-xl animate-[slideInLeft_0.25s_ease-out]">
            <Sidebar
              userName={userName}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* 主内容区 */}
      <main className="flex-1 min-w-0 flex flex-col pb-16 md:pb-0">
        {/* 移动端顶部栏 */}
        <div className="md:hidden flex items-center px-4 py-3 border-b border-stone-200 bg-white/80 backdrop-blur sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-stone-500 hover:text-stone-700 p-1 -ml-1 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="打开菜单"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-2 text-sm font-semibold text-stone-700">
            成长第二大脑
          </span>
          {userName && (
            <span className="ml-auto text-xs text-stone-400">
              {userName}
            </span>
          )}
        </div>

        {/* 页面内容 */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto animate-fade-in-up">{children}</div>

        {/* 移动端底部 Tab 栏 */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-border z-10 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around h-14">
            {mobileTabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] h-full transition-colors
                  ${
                    tab.active
                      ? "text-emerald-600"
                      : "text-stone-400 hover:text-stone-600"
                  }`}
              >
                {tab.icon}
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </main>
      </div>
      <QuickSwitcher open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
      <Toaster />
    </ToastProvider>
  );
}
