"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

interface DashboardShellProps {
  userName?: string;
  children: React.ReactNode;
}

export default function DashboardShell({ userName, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* 桌面端侧边栏 — md 及以上固定显示 */}
      <div className="hidden md:block shrink-0">
        <Sidebar userName={userName} />
      </div>

      {/* 移动端侧边栏 — 抽屉 + 遮罩 */}
      {sidebarOpen && (
        <>
          {/* 半透明遮罩 */}
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* 侧边栏滑入 */}
          <div className="fixed left-0 top-0 bottom-0 z-50 md:hidden shadow-xl">
            <Sidebar
              userName={userName}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* 主内容区 */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* 移动端顶部栏：汉堡按钮 */}
        <div className="md:hidden flex items-center px-4 py-3 border-b border-gray-200 bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-800 p-1 -ml-1"
            aria-label="打开菜单"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span className="ml-2 text-sm font-medium text-gray-700">🧠 成长第二大脑</span>
        </div>

        {/* 页面内容 */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
