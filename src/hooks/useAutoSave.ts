"use client";

import { useEffect, useRef, useCallback, useState } from "react";

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions {
  /** 自动保存的数据 */
  data: {
    title: string;
    content: string;
    tags: string[];
  };
  /** 保存回调 */
  onSave: (commitMessage?: string) => Promise<void>;
  /** 防抖延迟（毫秒），默认 2000 */
  delay?: number;
  /** 是否启用自动保存，默认 true */
  enabled?: boolean;
}

interface UseAutoSaveResult {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
}

export function useAutoSave({
  data,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveResult {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevDataRef = useRef(data);
  const savingRef = useRef(false);

  const doAutoSave = useCallback(async () => {
    // 标题为空不保存
    if (!data.title.trim()) return;
    // 内容无变化不保存
    if (
      data.title === prevDataRef.current.title &&
      data.content === prevDataRef.current.content &&
      JSON.stringify(data.tags) === JSON.stringify(prevDataRef.current.tags)
    ) {
      return;
    }

    if (savingRef.current) return;
    savingRef.current = true;
    setStatus("saving");

    try {
      await onSave("自动保存");
      prevDataRef.current = { ...data };
      setLastSavedAt(new Date());
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      savingRef.current = false;
    }
  }, [data, onSave]);

  const tagsKey = JSON.stringify(data.tags);

  useEffect(() => {
    if (!enabled) return;

    // 清除旧定时器
    if (timerRef.current) clearTimeout(timerRef.current);

    // 设置新定时器
    timerRef.current = setTimeout(() => {
      doAutoSave();
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.title, data.content, tagsKey, delay, enabled, doAutoSave]);

  // saved 状态持续 3 秒后转为 idle
  useEffect(() => {
    if (status === "saved") {
      const t = setTimeout(() => setStatus("idle"), 3000);
      return () => clearTimeout(t);
    }
  }, [status]);

  return { status, lastSavedAt };
}
