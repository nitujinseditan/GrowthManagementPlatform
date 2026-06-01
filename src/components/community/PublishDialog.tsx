"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

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
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>发布到社区</DialogTitle>
          <DialogDescription>
            发布后的帖子将公开可见，并关联回你的原始笔记。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-emerald-50 rounded-lg px-3 py-2.5 flex items-start gap-2">
            <span className="text-sm mt-px">💡</span>
            <p className="text-xs text-emerald-700 leading-relaxed">
              请确保内容适合公开分享。发布后可在笔记详情页取消发布。
            </p>
          </div>

          <Input
            label="帖子标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="帖子标题"
          />

          <Textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="简短描述这篇笔记的内容..."
            rows={3}
          />

          {excerpt && (
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <p className="text-xs font-medium text-stone-400 mb-1">预览</p>
              <p className="text-sm text-stone-600 line-clamp-3">{excerpt}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row gap-2 sm:gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button
            variant="gradient"
            onClick={handlePublish}
            disabled={publishing || !title.trim()}
            className="flex-1"
          >
            {publishing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                发布中...
              </span>
            ) : (
              "确认发布"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
