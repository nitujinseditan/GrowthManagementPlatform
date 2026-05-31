import type { Metadata } from "next";
import SessionProvider from "@/components/layout/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "成长第二大脑",
  description: "你的一站式个人成长管理平台 — 私密沉淀、智能复盘、有根分享",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-gray-50 text-gray-900 font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
