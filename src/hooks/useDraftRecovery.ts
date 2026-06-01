"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface DraftData {
  title: string;
  content: string;
  tags: string[];
  timestamp: number;
}

interface UseDraftRecoveryOptions {
  /** 草稿 key（区分不同笔记） */
  draftKey: string;
  /** 当前数据 */
  data: {
    title: string;
    content: string;
    tags: string[];
  };
  /** 最近一次成功保存的时间戳 */
  lastSavedTimestamp?: number;
}

interface UseDraftRecoveryResult {
  /** 是否有可恢复的草稿 */
  hasDraft: boolean;
  /** 草稿数据 */
  draft: DraftData | null;
  /** 恢复草稿 */
  recover: () => void;
  /** 丢弃草稿 */
  discard: () => void;
  /** 草稿的相对时间描述 */
  draftTime: string;
}

function getStorageKey(key: string): string {
  return `draft:note:${key}`;
}

function loadDraft(key: string): DraftData | null {
  try {
    const raw = localStorage.getItem(getStorageKey(key));
    if (!raw) return null;
    return JSON.parse(raw) as DraftData;
  } catch {
    return null;
  }
}

function saveDraft(key: string, data: DraftData): void {
  try {
    localStorage.setItem(getStorageKey(key), JSON.stringify(data));
  } catch {
    // localStorage 满或不可用，静默失败
  }
}

function clearDraft(key: string): void {
  try {
    localStorage.removeItem(getStorageKey(key));
  } catch {
    // 静默失败
  }
}

export function useDraftRecovery({
  draftKey,
  data,
  lastSavedTimestamp,
}: UseDraftRecoveryOptions): UseDraftRecoveryResult {
  const [draft, setDraft] = useState<DraftData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRecoveredRef = useRef(false);

  // 挂载时检测草稿
  useEffect(() => {
    const existing = loadDraft(draftKey);
    if (
      existing &&
      !hasRecoveredRef.current &&
      // 如果有 recent save timestamp 且晚于草稿，不提示
      (!lastSavedTimestamp || existing.timestamp > lastSavedTimestamp)
    ) {
      // 草稿内容不为空才提示
      if (existing.title || existing.content) {
        setDraft(existing);
      }
    }
  }, [draftKey, lastSavedTimestamp]);

  // 数据变化 → 防抖写入草稿（1秒）
  const tagsKey = JSON.stringify(data.tags);
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      // 标题和内容都为空时不写草稿
      if (!data.title.trim() && !data.content.trim()) return;

      saveDraft(draftKey, {
        ...data,
        timestamp: Date.now(),
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.title, data.content, tagsKey, draftKey]);

  // 恢复后自动清除草稿（延迟确保恢复完成）
  useEffect(() => {
    if (hasRecoveredRef.current && draft) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => clearDraft(draftKey), 500);
    }
  }, [draft, draftKey]);

  const recover = useCallback(() => {
    if (draft) {
      hasRecoveredRef.current = true;
      setDraft(null);
    }
  }, [draft]);

  const discard = useCallback(() => {
    clearDraft(draftKey);
    setDraft(null);
  }, [draftKey]);

  // 计算草稿时间描述
  const draftTime = draft
    ? (() => {
        const diff = Date.now() - draft.timestamp;
        const min = Math.floor(diff / 60000);
        if (min < 1) return "刚刚";
        if (min < 60) return `${min} 分钟前`;
        const hours = Math.floor(min / 60);
        if (hours < 24) return `${hours} 小时前`;
        return `${Math.floor(hours / 24)} 天前`;
      })()
    : "";

  return {
    hasDraft: draft !== null && !hasRecoveredRef.current,
    draft,
    recover,
    discard,
    draftTime,
  };
}

export { clearDraft };
