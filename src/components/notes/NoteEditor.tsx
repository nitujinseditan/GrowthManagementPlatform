"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import type { Note } from "@/types";

interface NoteEditorProps {
  note: Note | null;
  onSave: (title: string, content: string, commitMessage: string) => Promise<void>;
  saving: boolean;
}

export default function NoteEditor({ note, onSave, saving }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [commitMessage, setCommitMessage] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.currentVersion?.content || "");
    }
  }, [note]);

  const handleSave = async () => {
    await onSave(title, content, commitMessage || undefined as unknown as string);
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
      <div className="flex items-center gap-3">
        <Input
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="提交信息（可选，如：补充了实验数据）"
          className="flex-1 text-sm"
        />
        <Button onClick={handleSave} disabled={saving || !title.trim()}>
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
