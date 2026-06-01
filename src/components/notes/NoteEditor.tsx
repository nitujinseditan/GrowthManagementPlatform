"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  MarkdownToolbar,
  MarkdownPreview,
  WritingStats,
} from "@/components/markdown";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { useDraftRecovery, clearDraft } from "@/hooks/useDraftRecovery";
import TableOfContents from "@/components/notes/TableOfContents";
import SlashCommandMenu from "@/components/notes/SlashCommandMenu";
import type { SlashCommand } from "@/components/notes/slashCommands";
import { downloadMarkdown, exportPdf } from "@/lib/export";
import type { Note } from "@/types";

interface NoteEditorProps {
  note: Note | null;
  onSave: (
    title: string,
    content: string,
    commitMessage: string,
    tags: string[]
  ) => Promise<void>;
  saving: boolean;
  /** 自动保存回调 — 仅已有笔记（noteId 存在）时启用 */
  onAutoSave?: (
    title: string,
    content: string,
    tags: string[],
    commitMessage: string
  ) => Promise<void>;
}

export default function NoteEditor({ note, onSave, saving, onAutoSave }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [description, setDescription] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [zenMode, setZenMode] = useState(false);
  const zenModeRef = useRef(false);
  zenModeRef.current = zenMode;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // 斜杠命令状态
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const slashStartRef = useRef<number>(-1); // / 的位置

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

  // 自动保存（仅当 onAutoSave 提供且 title 非空时启用）
  const autoSave = onAutoSave
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useAutoSave({
        data: { title, content, tags },
        onSave: async (cm) => {
          await onAutoSave(title, content, tags, cm || "自动保存");
        },
        enabled: !!note && title.trim().length > 0,
      })
    : null;

  const relativeTime = useRelativeTime(autoSave?.lastSavedAt ?? null);

  // 草稿恢复
  const draftKey = note ? `note:${note.id}` : "note:new";
  const lastSaved = note?.updatedAt ? new Date(note.updatedAt).getTime() : undefined;
  const draft = useDraftRecovery({
    draftKey,
    data: { title, content, tags },
    lastSavedTimestamp: lastSaved,
  });

  // 草稿恢复处理
  const handleRecover = () => {
    if (draft.draft) {
      setTitle(draft.draft.title);
      setContent(draft.draft.content);
      setTags(draft.draft.tags);
    }
    draft.recover();
  };

  // 加载已有笔记数据
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.currentVersion?.content || "");
      setTags((note.tags || []).map((t) => t.name));
      setDescription(note.description || "");
      setIsPinned(note.isPinned || false);
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

  // 斜杠命令检测
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(newValue);

    // 检测是否在行首或空格后输入了 /
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const slashMatch = textBeforeCursor.match(/(?:^|[\s\n])(\/)([^\s\n]*)$/);

    if (slashMatch) {
      const slashPos = cursorPos - slashMatch[2].length - 1;
      slashStartRef.current = slashPos;
      setSlashQuery(slashMatch[2]);
      setSlashOpen(true);
    } else {
      setSlashOpen(false);
      slashStartRef.current = -1;
    }
  };

  // 斜杠命令选择
  const handleSlashSelect = (cmd: SlashCommand) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = slashStartRef.current;
    if (start < 0) return;

    const cursorPos = textarea.selectionStart;
    const before = content.slice(0, start);
    const after = content.slice(cursorPos);

    const newText = before + cmd.before + cmd.after + after;
    setContent(newText);

    // 计算光标位置
    const cursorTarget = start + cmd.before.length;

    // 使用 setTimeout 确保 React 更新后再设置光标
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorTarget, cursorTarget);
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }, 0);

    setSlashOpen(false);
    setSlashQuery("");
    slashStartRef.current = -1;
  };

  const handleSlashClose = () => {
    setSlashOpen(false);
    setSlashQuery("");
    slashStartRef.current = -1;
  };

  // 保存
  const handleSave = async () => {
    setSaved(false);
    await onSave(
      title,
      content,
      commitMessage || (undefined as unknown as string),
      tags
    );
    setCommitMessage("");
    setSaved(true);
    clearDraft(draftKey); // 保存成功后清除草稿
    setTimeout(() => setSaved(false), 2000);
  };

  // 快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const textarea = textareaRef.current;
      const isTextareaFocused = document.activeElement === textarea;

      // Ctrl+S / Cmd+S → 保存
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
        return;
      }

      // F11 或 Ctrl+Shift+F → 禅模式
      if (e.key === "F11" || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "f")) {
        e.preventDefault();
        setZenMode((prev) => !prev);
        return;
      }

      // Escape → 退出禅模式
      if (e.key === "Escape" && zenModeRef.current) {
        e.preventDefault();
        setZenMode(false);
        return;
      }

      // 以下快捷键仅在 Textarea 聚焦时生效
      if (!isTextareaFocused) return;

      const start = textarea!.selectionStart;
      const end = textarea!.selectionEnd;
      const selected = textarea!.value.substring(start, end);
      const wrap = (before: string, after: string) => {
        e.preventDefault();
        const replacement = before + selected + after;
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value"
        )?.set;
        setter?.call(
          textarea,
          textarea!.value.substring(0, start) +
            replacement +
            textarea!.value.substring(end)
        );
        textarea!.dispatchEvent(new Event("input", { bubbles: true }));
        textarea!.setSelectionRange(
          start + before.length,
          start + before.length + selected.length
        );
      };

      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        wrap("**", "**");
      } else if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        wrap("*", "*");
      } else if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        wrap("[", "](url)");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="space-y-4">
      {/* 草稿恢复提示 */}
      {draft.hasDraft && draft.draft && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl
                        motion-safe:animate-[fadeInUp_0.3s_ease-out_both]">
          <div className="flex items-center gap-2 text-sm text-amber-700 min-w-0">
            <span className="text-base shrink-0">📝</span>
            <span className="truncate">
              检测到{draft.draftTime}的草稿，是否恢复？
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRecover}
              className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-500
                         rounded-lg hover:bg-emerald-600 transition-colors"
            >
              恢复
            </button>
            <button
              type="button"
              onClick={draft.discard}
              className="px-3 py-1.5 text-xs font-medium text-stone-500 bg-stone-100
                         rounded-lg hover:bg-stone-200 transition-colors"
            >
              丢弃
            </button>
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
            className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm
                       transition-colors
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
          className="text-sm text-stone-400 border-transparent hover:border-stone-200 focus:border-emerald-400 px-0 !rounded-none !shadow-none focus:!shadow-none !bg-transparent"
        />
      )}

      {/* 移动端预览切换按钮 + 禅模式按钮 */}
      <div className="flex items-center gap-2">
        <div className="lg:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-emerald-600
                       px-3 py-1.5 rounded-lg border border-stone-200 bg-white transition-colors"
          >
            {showPreview ? (
              <>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                显示预览
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                仅编辑
              </>
            )}
          </button>
        </div>

        {/* 禅模式切换按钮 */}
        <button
          type="button"
          onClick={() => setZenMode(!zenMode)}
          title={zenMode ? "退出禅模式 (F11)" : "禅模式 (F11)"}
          className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border
                       transition-colors
                       ${
                         zenMode
                           ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                           : "text-stone-400 hover:text-stone-600 border-stone-200 bg-white"
                       }`}
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

      {/* 双栏主体：左编辑 右预览 */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6">
        {/* 左栏：编辑区 */}
        <div className="flex flex-col space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 overflow-x-auto">
              <MarkdownToolbar textareaRef={textareaRef} />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => downloadMarkdown(title || "未命名", content)}
                title="导出 Markdown"
                className="text-xs text-stone-400 hover:text-stone-600 px-2 py-1 rounded-lg
                         hover:bg-stone-100 transition-colors"
              >
                .md
              </button>
              <button
                type="button"
                onClick={exportPdf}
                title="导出 PDF"
                className="text-xs text-stone-400 hover:text-stone-600 px-2 py-1 rounded-lg
                         hover:bg-stone-100 transition-colors"
              >
                PDF
              </button>
            </div>
          </div>
          <div className="relative flex-1 min-h-0">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="开始用 Markdown 记录你的想法...&#10;&#10;输入 / 打开命令菜单&#10;## 二级标题&#10;**加粗** *斜体*&#10;- 列表项&#10;> 引用&#10;`行内代码`"
              className="flex-1 min-h-[420px] resize-none font-mono text-sm leading-relaxed w-full"
            />
            <SlashCommandMenu
              open={slashOpen}
              query={slashQuery}
              onSelect={handleSlashSelect}
              onClose={handleSlashClose}
            />
          </div>
          <WritingStats content={content} />
        </div>

        {/* 右栏：预览区 + TOC */}
        <div className="flex gap-0">
          <div
            ref={previewContainerRef}
            className={`${
              showPreview ? "block" : "hidden lg:block"
            } flex-1 min-w-0 min-h-[420px] border border-stone-200 rounded-lg bg-white p-5 overflow-y-auto`}
          >
            <MarkdownPreview content={content} />
          </div>

          {/* 目录导航 — xl 屏幕显示 */}
          <TableOfContents
            content={content}
            previewContainerRef={previewContainerRef}
          />
        </div>
      </div>

      {/* 标签区域 */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          标签
        </label>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="primary"
                removable
                onRemove={() => removeTag(tag)}
              >
                {tag}
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-stone-100">
        <Input
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="提交信息（可选，如：补充了实验数据）"
          className="flex-1 text-sm"
        />
        <Button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="shrink-0"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              保存中...
            </span>
          ) : saved ? (
            <span className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              已保存
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              保存
            </span>
          )}
        </Button>
      </div>

      {/* 自动保存状态指示器 */}
      {autoSave && (
        <p className="text-xs flex items-center gap-1.5">
          {autoSave.status === "saving" && (
            <>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-600">自动保存中...</span>
            </>
          )}
          {autoSave.status === "saved" && (
            <>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-600">已自动保存</span>
              {relativeTime && (
                <span className="text-stone-400">（{relativeTime}）</span>
              )}
            </>
          )}
          {autoSave.status === "error" && (
            <>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-red-500">自动保存失败，请手动保存</span>
            </>
          )}
        </p>
      )}

      {/* 当前版本信息 */}
      {note?.currentVersion && (
        <p className="text-xs text-stone-400 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
          当前版本 v{note.currentVersion.versionNumber}
          {note.currentVersion.commitMessage &&
            ` — ${note.currentVersion.commitMessage}`}
        </p>
      )}
    </div>
  );
}
