"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Spinner from "@/components/ui/Spinner";
import type { Comment } from "@/types";

export default function CommentSection({ postId }: { postId: number }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments || []))
      .finally(() => setLoading(false));
  }, [postId]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setContent("");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-5">
      <h4 className="font-semibold text-stone-900 flex items-center gap-2">
        <svg className="h-4 w-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        评论 ({comments.length})
      </h4>

      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3 group">
              <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-xs font-medium text-stone-500 shrink-0 mt-0.5">
                {(c.authorName || "?").charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-stone-700">
                    {c.authorName}
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(c.createdAt).toLocaleDateString("zh-CN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-6 text-stone-400 text-sm">
              <p>暂无评论，来发表第一条评论吧 ✨</p>
            </div>
          )}
        </div>
      )}

      {session ? (
        <div className="flex gap-2 pt-2 border-t border-stone-100">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-medium text-emerald-700 shrink-0 mt-1">
            {(session.user?.name || "?").charAt(0)}
          </div>
          <div className="flex-1 space-y-2">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你的想法..."
              rows={2}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
                size="sm"
              >
                {submitting ? "发送中..." : "发表评论"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-stone-400 text-center py-3 bg-stone-50 rounded-lg">
          请{" "}
          <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
            登录
          </a>{" "}
          后发表评论
        </div>
      )}
    </div>
  );
}
