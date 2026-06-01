"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CommentSection from "@/components/community/CommentSection";
import Spinner from "@/components/ui/Spinner";
import { MarkdownPreview } from "@/components/markdown";
import type { Post } from "@/types";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = parseInt(params.id as string, 10);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState<string>("");

  useEffect(() => {
    fetch(`/api/posts/${postId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.post) {
          setPost(data.post);
          // 获取关联笔记内容（公开可见）
          fetch(`/api/notes/${data.post.noteId}`)
            .then((r) => {
              if (r.status === 401) return null;
              return r.json();
            })
            .then((noteData) => {
              if (noteData?.note?.currentVersion?.content) {
                setNoteContent(noteData.note.currentVersion.content);
              }
            })
            .catch(() => {});
        }
      })
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-stone-500">帖子不存在</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 返回 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/community")}
        className="mb-4"
      >
        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回社区
      </Button>

      {/* 帖子内容 */}
      <Card className="p-6 mb-6">
        {/* 作者信息 */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-base font-medium text-emerald-700 shrink-0">
            {(post.authorName || "?").charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-stone-700">
              {post.authorName}
            </p>
            <p className="text-xs text-stone-400">
              {new Date(post.createdAt).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-stone-900 mb-3">{post.title}</h1>

        {noteContent && (
          <div className="border-t border-stone-100 pt-4 mt-4">
            <MarkdownPreview content={noteContent} />
          </div>
        )}
      </Card>

      {/* 评论区 */}
      <Card className="p-6">
        <CommentSection postId={postId} />
      </Card>
    </div>
  );
}
