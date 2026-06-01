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
}

export default function NoteEditor({ note, onSave, saving }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 加载已有笔记数据
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.currentVersion?.content || "");
      setTags((note.tags || []).map((t) => t.name));
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
    await onSave(
      title,
      content,
      commitMessage || (undefined as unknown as string),
      tags
    );
    setCommitMessage("");
    setSaved(true);
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
      {/* 标题 */}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="笔记标题..."
        className="text-xl font-semibold border-transparent hover:border-stone-200 focus:border-emerald-400 px-0 !rounded-none !shadow-none focus:!shadow-none !bg-transparent"
      />

      {/* 移动端预览切换按钮 */}
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

      {/* 双栏主体：左编辑 右预览 */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6">
        {/* 左栏：编辑区 */}
        <div className="flex flex-col space-y-3 min-w-0">
          <MarkdownToolbar textareaRef={textareaRef} />
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="开始用 Markdown 记录你的想法...&#10;&#10;## 二级标题&#10;**加粗** *斜体* &#10;- 列表项&#10;> 引用&#10;`行内代码`"
            className="flex-1 min-h-[420px] resize-none font-mono text-sm leading-relaxed"
          />
          <WritingStats content={content} />
        </div>

        {/* 右栏：预览区 */}
        <div
          className={`${
            showPreview ? "block" : "hidden lg:block"
          } min-h-[420px] border border-stone-200 rounded-lg bg-white p-5 overflow-y-auto`}
        >
          <MarkdownPreview content={content} />
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
