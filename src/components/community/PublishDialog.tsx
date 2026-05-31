"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
  noteTitle: string;
  noteContent: string;
  onPublish: (title: string, excerpt: string) => Promise<void>;
  publishing: boolean;
}

export default function PublishDialog({
  open,
  onClose,
  noteTitle,
  noteContent,
  onPublish,
  publishing,
}: PublishDialogProps) {
  const [title, setTitle] = useState(noteTitle);
  const [excerpt, setExcerpt] = useState(noteContent.slice(0, 200));

  const handlePublish = async () => {
    await onPublish(title, excerpt);
  };

  return (
    <Modal open={open} onClose={onClose} title="发布到社区">
      <div className="space-y-4">
        <Input
          label="帖子标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="帖子标题"
        />
        <Textarea
          label="摘要"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="简短描述这篇笔记的内容"
          rows={3}
        />
        <p className="text-xs text-gray-400">
          发布后的帖子将公开可见，并关联回你的原始笔记。
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handlePublish} disabled={publishing || !title.trim()}>
            {publishing ? "发布中..." : "确认发布"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
