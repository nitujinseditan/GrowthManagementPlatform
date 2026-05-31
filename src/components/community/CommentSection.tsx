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
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">
        评论 ({comments.length})
      </h4>
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {c.authorName}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
              <p className="text-sm text-gray-600">{c.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-400 text-sm">暂无评论，来说两句吧</p>
          )}
        </div>
      )}
      {session ? (
        <div className="flex gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="发表评论..."
            rows={2}
          />
          <Button
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            size="sm"
          >
            {submitting ? "发送中..." : "发送"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          请<a href="/login" className="text-emerald-600 hover:underline">登录</a>后发表评论
        </p>
      )}
    </div>
  );
}
