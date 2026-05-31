"use client";

import { useState, useEffect, useCallback } from "react";
import PostCard from "@/components/community/PostCard";
import TagFilter from "@/components/notes/TagFilter";
import Spinner from "@/components/ui/Spinner";
import type { Post } from "@/types";

interface Tag {
  id: number;
  name: string;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // 加载标签（仅首次）
  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => setTags(data.tags || []));
  }, []);

  // 加载帖子（标签或页码变化时重新加载）
  const fetchPosts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (selectedTags.length > 0) {
      params.set("tags", selectedTags.join(","));
    }
    fetch(`/api/posts?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page, selectedTags]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 标签变化时重置到第一页
  const handleTagsChange = (tagIds: number[]) => {
    setSelectedTags(tagIds);
    setPage(1);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">社区</h1>

      {/* 标签筛选栏 */}
      <TagFilter
        tags={tags}
        selected={selectedTags}
        onChange={handleTagsChange}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-8 w-8" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">🌐</p>
          <p className="text-lg">还没有帖子</p>
          <p className="text-sm">快去发布你的第一篇笔记吧！</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          {total > 20 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
              >
                上一页
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">
                第 {page} 页
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={posts.length < 20}
                className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
