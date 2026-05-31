"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface SidebarProps {
  userName?: string;
  onClose?: () => void; // 移动端关闭回调
}

export default function Sidebar({ userName, onClose }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/notes", label: "📝 我的笔记", active: pathname.startsWith("/notes") },
    { href: "/community", label: "🌐 社区", active: pathname.startsWith("/community") },
  ];

  const handleNav = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="w-56 min-h-screen border-r border-gray-200 bg-white flex flex-col">
      {/* 品牌区 + 移动端关闭按钮 */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <Link href="/notes" className="text-lg font-bold text-gray-800">
          🧠 成长第二大脑
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-gray-600 p-1"
            aria-label="关闭菜单"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={handleNav}
            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
              link.active
                ? "bg-emerald-50 text-emerald-700 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {userName && (
        <div className="p-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-1">{userName}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs text-red-500 hover:text-red-700"
          >
            退出登录
          </button>
        </div>
      )}
    </aside>
  );
}
