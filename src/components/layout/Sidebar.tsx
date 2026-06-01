"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface SidebarProps {
  userName?: string;
  onClose?: () => void;
}

export default function Sidebar({ userName, onClose }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    {
      href: "/notes",
      label: "我的笔记",
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

  const handleNav = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="w-56 min-h-screen border-r border-stone-200/80 bg-stone-50 flex flex-col">
      {/* 品牌区 */}
      <div className="p-4 border-b border-stone-200/60 flex items-center justify-between">
        <Link
          href="/notes"
          className="flex items-center gap-2 text-base font-bold text-stone-800 hover:text-emerald-700 transition-colors"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500 text-white text-sm">
            🧠
          </span>
          成长第二大脑
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="关闭菜单"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 导航 */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={handleNav}
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150
              ${
                link.active
                  ? "bg-white text-emerald-700 shadow-sm border border-stone-200/60"
                  : "text-stone-500 hover:text-stone-700 hover:bg-white/60"
              }`}
          >
            {/* 左侧激活指示条 */}
            {link.active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 rounded-r-full" />
            )}
            <span className={link.active ? "text-emerald-600" : "text-stone-400 group-hover:text-stone-500 transition-colors"}>
              {link.icon}
            </span>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* 用户区 */}
      {userName && (
        <div className="p-3 border-t border-stone-200/60">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-700">
              {userName.charAt(0)}
            </div>
            <p className="text-sm text-stone-700 font-medium truncate flex-1">
              {userName}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 text-xs text-stone-400 hover:text-red-500 transition-colors w-full px-1 py-1"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            退出登录
          </button>
        </div>
      )}
    </aside>
  );
}
