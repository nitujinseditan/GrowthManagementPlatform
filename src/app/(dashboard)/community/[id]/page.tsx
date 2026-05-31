"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import CommentSection from "@/components/community/CommentSection";
import Spinner from "@/components/ui/Spinner";
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
          fetch(`/api/posts/${postId}`)
            .then((r) => r.json())
            .then((d) => {
              if (d.post) {
                // 从 API 获取笔记内容
                fetch(`/api/notes/${d.post.noteId}`)
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
            });
        }
      })
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>帖子不存在</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.push("/community")}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        ← 返回社区
      </button>

      <Card className="p-6 mb-6">
        <h1 className="text-2xl font-bold mb-3">{post.title}</h1>
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
          <span>{post.authorName}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString("zh-CN")}</span>
        </div>
        {noteContent && (
          <div className="prose prose-sm max-w-none border-t pt-4 whitespace-pre-wrap">
            {noteContent}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <CommentSection postId={postId} />
      </Card>
    </div>
  );
}
