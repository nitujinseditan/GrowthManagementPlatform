"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

interface NoteItem {
  id: number;
  title: string;
  updatedAt: string;
  tags?: { name: string }[];
}

interface QuickSwitcherProps {
  open: boolean;
  onClose: () => void;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function QuickSwitcher({ open, onClose }: QuickSwitcherProps) {
  const [query, setQuery] = useState("");
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 打开时获取笔记列表
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      fetch("/api/notes")
        .then((r) => r.json())
        .then((data) => {
          if (data.notes) setNotes(data.notes);
        })
        .catch(() => setNotes([]));
      // 自动聚焦
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // 过滤
  const filtered = query.trim()
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.tags?.some((t) => t.name.toLowerCase().includes(query.toLowerCase()))
      )
    : notes.slice(0, 8); // 默认显示最近 8 条

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: globalThis.KeyboardEvent) => {
      if (!open) return;
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev >= filtered.length - 1 ? 0 : prev + 1
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev <= 0 ? filtered.length - 1 : prev - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filtered[selectedIndex]) {
            router.push(`/notes/${filtered[selectedIndex].id}`);
            onClose();
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [open, filtered, selectedIndex, router, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // 滚动选中项到可见
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector("[data-selected]");
      if (selected) selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-start justify-center pt-[15vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* 面板 */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-stone-200
                      overflow-hidden motion-safe:animate-[scaleIn_0.15s_ease-out_both]">
        {/* 搜索框 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100">
          <svg className="h-4 w-4 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="搜索笔记...（Ctrl+P）"
            className="flex-1 text-sm bg-transparent border-none outline-none text-stone-700
                       placeholder:text-stone-300"
          />
          <kbd className="text-[10px] text-stone-400 bg-stone-100 rounded px-1.5 py-0.5 font-mono">ESC</kbd>
        </div>

        {/* 结果列表 */}
        <div ref={listRef} className="max-h-[320px] overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-8">
              {notes.length === 0 ? "加载中..." : "没有匹配的笔记"}
            </p>
          ) : (
            filtered.map((note, idx) => (
              <button
                key={note.id}
                type="button"
                data-selected={idx === selectedIndex ? "true" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                           transition-colors duration-75
                           ${
                             idx === selectedIndex
                               ? "bg-emerald-50"
                               : "hover:bg-stone-50"
                           }`}
                onClick={() => {
                  router.push(`/notes/${note.id}`);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <span className="text-lg shrink-0">📄</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-stone-700 truncate">
                    {note.title || "无标题"}
                  </span>
                  {note.tags && note.tags.length > 0 && (
                    <span className="flex gap-1 mt-0.5">
                      {note.tags.slice(0, 3).map((t) => (
                        <span
                          key={t.name}
                          className="text-[10px] text-stone-400 bg-stone-100 rounded-full px-2 py-0.5"
                        >
                          {t.name}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-stone-400 shrink-0">
                  {formatDate(note.updatedAt)}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
