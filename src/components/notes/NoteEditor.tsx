"use client";

import { useState, useEffect, useCallback } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
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
  const [saved, setSaved] = useState(false); // 保存成功反馈

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.currentVersion?.content || "");
      setTags((note.tags || []).map((t) => t.name));
    }
  }, [note]);

  // 添加标签：输入逗号或回车时触发
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

  const handleSave = async () => {
    setSaved(false);
    await onSave(title, content, commitMessage || (undefined as unknown as string), tags);
    setCommitMessage("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // 快捷键 Ctrl+S / Cmd+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="space-y-5">
      {/* 标题：大字号、无视觉边框 */}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="笔记标题..."
        className="text-xl font-semibold border-transparent hover:border-stone-200 focus:border-emerald-400 px-0 !rounded-none !shadow-none focus:!shadow-none !bg-transparent"
      />

      {/* 内容 */}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="开始记录你的想法..."
        rows={16}
        className="min-h-[300px] resize-y border-stone-100 focus:border-emerald-400"
      />

      {/* 标签区域 */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          标签
        </label>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="primary" removable onRemove={() => removeTag(tag)}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          onBlur={() => tagInput && addTag(tagInput)}
          placeholder={tags.length > 0 ? "继续添加标签..." : "输入标签，回车添加（如：考研、英语）"}
          className="text-sm"
        />
        <p className="text-xs text-stone-400 mt-1">
          输入后按 Enter 或逗号分隔，支持多个标签
        </p>
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
