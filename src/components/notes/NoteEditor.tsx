"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import TurndownService from "turndown";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useDraftRecovery, clearDraft } from "@/hooks/useDraftRecovery";
import type { Note } from "@/types";

// NovelEditor 动态导入（避免 SSR 问题）
const NovelEditor = dynamic(() => import("./NovelEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[300px] flex items-center justify-center text-muted-foreground text-sm">
      加载编辑器...
    </div>
  ),
});

// turndown 实例：HTML → Markdown
const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

interface NoteEditorProps {
  note: Note | null;
  onSave: (
    title: string,
    content: string,
    commitMessage: string,
    tags: string[],
    contentHtml?: string
  ) => Promise<void>;
  saving: boolean;
  onDirtyChange?: (dirty: boolean) => void;
}

export default function NoteEditor({ note, onSave, saving, onDirtyChange }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [description, setDescription] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [saved, setSaved] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const zenModeRef = useRef(false);
  zenModeRef.current = zenMode;

  // 禅模式：切换 body class
  useEffect(() => {
    if (zenMode) {
      document.body.classList.add("zen-mode");
    } else {
      document.body.classList.remove("zen-mode");
    }
    return () => {
      document.body.classList.remove("zen-mode");
    };
  }, [zenMode]);

  // 脏状态追踪
  const lastSavedSnapshot = useRef<{ title: string; contentHtml: string; tags: string[] } | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const checkDirty = useCallback(
    (currentTitle: string, currentHtml: string, currentTags: string[]) => {
      const snap = lastSavedSnapshot.current;
      if (!snap) {
        return currentTitle.trim().length > 0 || currentHtml.trim().length > 0;
      }
      return (
        currentTitle !== snap.title ||
        currentHtml !== snap.contentHtml ||
        JSON.stringify(currentTags) !== JSON.stringify(snap.tags)
      );
    },
    []
  );

  useEffect(() => {
    const dirty = checkDirty(title, contentHtml, tags);
    setIsDirty(dirty);
  }, [title, contentHtml, tags, checkDirty]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // 草稿恢复
  const draftKey = note ? `note:${note.id}` : "note:new";
  const lastSaved = note?.updatedAt ? new Date(note.updatedAt).getTime() : undefined;
  const draft = useDraftRecovery({
    draftKey,
    data: { title, content: contentHtml, tags },
    lastSavedTimestamp: lastSaved,
  });

  const handleRecover = () => {
    if (draft.draft) {
      setTitle(draft.draft.title);
      setContentHtml(draft.draft.content);
      setTags(draft.draft.tags);
    }
    draft.recover();
  };

  // 加载已有笔记数据
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      // 优先使用 contentHtml，如果没有则用 content（Markdown）
      const html = note.currentVersion?.contentHtml || "";
      const md = note.currentVersion?.content || "";
      // 如果没有 HTML 但有 Markdown，用 Markdown（旧版本兼容）
      setContentHtml(html || (md ? `<p>${md.replace(/\n/g, "</p><p>")}</p>` : ""));
      const loadedTags = (note.tags || []).map((t) => t.name);
      setTags(loadedTags);
      setDescription(note.description || "");
      setIsPinned(note.isPinned || false);
      lastSavedSnapshot.current = {
        title: note.title,
        contentHtml: html || "",
        tags: loadedTags,
      };
    }
  }, [note]);

  // 添加标签
  const addTag = useCallback(
    (raw: string) => {
      const names = raw
        .split(/[,，、\s]+/)
        .map((t) => t.trim())
        .filter(Boolean);
      const newTags = names.filter((n) => !tags.includes(n));
      if (newTags.length > 0) {
        setTags((prev) => [...prev, ...newTags]);
      }
      setTagInput("");
    },
    [tags]
  );

  const removeTag = (name: string) => {
    setTags((prev) => prev.filter((t) => t !== name));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  // 保存
  const handleSave = async () => {
    setSaved(false);
    // 将 HTML 转为 Markdown 用于 diff 和旧版本兼容
    const markdown = contentHtml ? turndown.turndown(contentHtml) : "";
    await onSave(
      title,
      markdown,
      commitMessage || (undefined as unknown as string),
      tags,
      contentHtml
    );
    setCommitMessage("");
    setSaved(true);
    lastSavedSnapshot.current = { title, contentHtml, tags: [...tags] };
    clearDraft(draftKey);
    setTimeout(() => setSaved(false), 2000);
  };

  // 快捷键：Ctrl+S 保存、F11 禅模式
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
        return;
      }
      if (e.key === "F11" || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "f")) {
        e.preventDefault();
        setZenMode((prev) => !prev);
        return;
      }
      if (e.key === "Escape" && zenModeRef.current) {
        e.preventDefault();
        setZenMode(false);
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="space-y-4">
      {/* 草稿恢复提示 */}
      {draft.hasDraft && draft.draft && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl motion-safe:animate-[fadeInUp_0.3s_ease-out_both]">
          <div className="flex items-center gap-2 text-sm text-amber-700 min-w-0">
            <span className="text-base shrink-0">📝</span>
            <span className="truncate">
              检测到{draft.draftTime}的草稿，是否恢复？
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="gradient" onClick={handleRecover}>
              恢复
            </Button>
            <Button size="sm" variant="secondary" onClick={draft.discard}>
              丢弃
            </Button>
          </div>
        </div>
      )}

      {/* 标题 + 置顶按钮 */}
      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="笔记标题..."
          className="text-xl font-semibold border-transparent hover:border-stone-200 focus:border-emerald-400 px-0 !rounded-none !shadow-none focus:!shadow-none !bg-transparent flex-1"
        />
        {note && (
          <button
            type="button"
            onClick={async () => {
              const newPinned = !isPinned;
              setIsPinned(newPinned);
              try {
                await fetch(`/api/notes/${note.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ isPinned: newPinned }),
                });
              } catch { setIsPinned(!newPinned); }
            }}
            title={isPinned ? "取消置顶" : "置顶"}
            className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors
                       ${isPinned
                         ? "bg-emerald-50 text-emerald-600"
                         : "text-stone-300 hover:text-amber-500 hover:bg-stone-50"}`}
          >
            📌
          </button>
        )}
      </div>

      {/* 描述 */}
      {note && (
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={async () => {
            if (description !== (note.description || "")) {
              try {
                await fetch(`/api/notes/${note.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ description }),
                });
              } catch { /* 静默 */ }
            }
          }}
          placeholder="添加简短描述..."
          className="text-sm text-muted-foreground border-transparent hover:border-stone-200 focus:border-emerald-400 px-0 !rounded-none !shadow-none focus:!shadow-none !bg-transparent"
        />
      )}

      {/* 禅模式切换按钮 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setZenMode(!zenMode)}
          title={zenMode ? "退出禅模式 (F11)" : "禅模式 (F11)"}
          className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors
                       ${zenMode
                         ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                         : "text-muted-foreground hover:text-foreground border-border bg-white"}`}
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {zenMode ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            )}
          </svg>
          {zenMode ? "退出禅模式" : "禅模式"}
        </button>
      </div>

      {/* Novel 编辑器 */}
      <div className="editor-container border border-border rounded-xl bg-white min-h-[420px] p-4">
        <NovelEditor
          initialContent={contentHtml}
          onUpdate={setContentHtml}
          placeholder="开始写作... 输入 / 唤出命令菜单"
        />
      </div>

      {/* 标签区域 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          标签
        </label>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="gap-1 pr-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors"
                  aria-label="移除"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => tagInput && addTag(tagInput)}
            placeholder={
              tags.length > 0 ? "继续添加标签..." : "输入标签，回车添加"
            }
            className="text-sm"
          />
        </div>
      </div>

      {/* 底部：提交信息 + 保存按钮 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-border">
        <Input
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="提交信息（可选，如：补充了实验数据）"
          className="flex-1 text-sm"
        />
        <Button
          variant="gradient"
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="shrink-0"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              保存中...
            </span>
          ) : saved ? (
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              已保存
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              保存
            </span>
          )}
        </Button>
      </div>

      {/* 当前版本信息 */}
      {note?.currentVersion && (
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
          当前版本 v{note.currentVersion.versionNumber}
          {note.currentVersion.commitMessage &&
            ` — ${note.currentVersion.commitMessage}`}
        </p>
      )}
    </div>
  );
}
