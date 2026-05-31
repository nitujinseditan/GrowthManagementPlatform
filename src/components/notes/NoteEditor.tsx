"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type { Note } from "@/types";

interface NoteEditorProps {
  note: Note | null;
  onSave: (title: string, content: string, commitMessage: string, tags: string[]) => Promise<void>;
  saving: boolean;
}

export default function NoteEditor({ note, onSave, saving }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.currentVersion?.content || "");
      // 已有标签 → 逗号分隔回填到输入框
      setTagInput((note.tags || []).map((t) => t.name).join(", "));
    }
  }, [note]);

  // 从输入框解析标签数组："考研, 英语" → ["考研", "英语"]
  const parseTags = (input: string): string[] =>
    input
      .split(/[,，、\s]+/)
      .map((t) => t.trim())
      .filter(Boolean);

  const handleSave = async () => {
    const tags = parseTags(tagInput);
    await onSave(title, content, commitMessage || undefined as unknown as string, tags);
    setCommitMessage("");
  };

  return (
    <div className="space-y-4">
      <Input
        label="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="笔记标题"
      />
      <Textarea
        label="内容"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="开始记录..."
        rows={15}
      />
      <Input
        label="标签（可选）"
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        placeholder="用逗号分隔，如：考研, 英语, 复盘"
      />
      <div className="flex items-center gap-3">
        <Input
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="提交信息（可选，如：补充了实验数据）"
          className="flex-1 text-sm"
        />
        <Button onClick={handleSave} disabled={saving || !title.trim()} className="shrink-0">
          {saving ? "保存中..." : "保存"}
        </Button>
      </div>
      {note?.currentVersion && (
        <p className="text-xs text-gray-400">
          当前版本 v{note.currentVersion.versionNumber}
          {note.currentVersion.commitMessage && ` — ${note.currentVersion.commitMessage}`}
        </p>
      )}
    </div>
  );
}
