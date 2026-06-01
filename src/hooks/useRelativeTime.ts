"use client";

import { useState, useEffect } from "react";

/**
 * 将 Date 转换为相对时间字符串（中文）
 * 返回示例: "刚刚", "3 分钟前", "1 小时前", "昨天 14:30", "3 天前"
 */
export function formatRelativeTime(date: Date | null): string {
  if (!date) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 10) return "刚刚";
  if (diffSec < 60) return `${diffSec} 秒前`;
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay === 1) {
    return `昨天 ${date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffDay < 7) return `${diffDay} 天前`;
  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

export function useRelativeTime(date: Date | null, interval = 30000): string {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), interval);
    return () => clearInterval(timer);
  }, [interval]);

  return formatRelativeTime(date);
}
