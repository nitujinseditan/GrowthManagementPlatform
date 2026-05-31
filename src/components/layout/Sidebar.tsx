"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Sidebar({ userName }: { userName?: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/notes", label: "📝 我的笔记", active: pathname.startsWith("/notes") },
    { href: "/community", label: "🌐 社区", active: pathname.startsWith("/community") },
  ];

  return (
    <aside className="w-56 min-h-screen border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <Link href="/notes" className="text-lg font-bold text-gray-800">
          🧠 成长第二大脑
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
              link.active
                ? "bg-blue-50 text-blue-700 font-medium"
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
