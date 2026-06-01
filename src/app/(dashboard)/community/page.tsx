"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PostCard from "@/components/community/PostCard";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import type { Post } from "@/types";

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPosts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    }
    fetch(`/api/posts?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* 顶部 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">社区</h1>
        {total > 0 && (
          <p className="text-sm text-stone-400 mt-1">{total} 篇帖子</p>
        )}
      </div>

      {/* 搜索栏 */}
      <div className="relative mb-6 group">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-emerald-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="搜索帖子标题或摘要..."
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-input rounded-xl bg-background
                     focus:outline-none focus:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]
                     placeholder:text-muted-foreground transition-all duration-200"
        />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setDebouncedSearch("");
              setPage(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 内容区域 */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <div className="text-5xl mb-4">
            {debouncedSearch ? "🔍" : "🌐"}
          </div>
          <p className="text-lg font-medium text-stone-500 mb-2">
            {debouncedSearch ? "未找到匹配的帖子" : "还没有帖子"}
          </p>
          <p className="text-sm">
            {debouncedSearch
              ? `未找到关于「${debouncedSearch}」的帖子，试试其他关键词吧`
              : "快去发布你的第一篇笔记吧！"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className={`animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>

          {/* 分页 */}
          {total > 20 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {page} 页 / 共 {Math.ceil(total / 20)} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={posts.length < 20}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
