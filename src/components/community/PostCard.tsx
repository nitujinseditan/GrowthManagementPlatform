import Link from "next/link";
import Card from "@/components/ui/Card";
import type { Post } from "@/types";

export default function PostCard({ post }: { post: Post }) {
  // 相对时间
  const relativeTime = getRelativeTime(new Date(post.createdAt));

  return (
    <Link href={`/community/${post.id}`}>
      <Card className="p-5 h-full flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        {/* 作者行 */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-medium text-emerald-700 shrink-0">
            {(post.authorName || "?").charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-700 truncate">
              {post.authorName}
            </p>
            <p className="text-xs text-stone-400">{relativeTime}</p>
          </div>
        </div>

        {/* 标题 */}
        <h3 className="font-semibold text-stone-900 leading-snug line-clamp-2">
          {post.title}
        </h3>

        {/* 摘要 */}
        <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed flex-1">
          {post.excerpt || "暂无摘要"}
        </p>

        {/* 底部信息 */}
        <div className="flex items-center gap-3 text-xs text-stone-400 pt-2 border-t border-stone-50">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {post.commentCount ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {post.likeCount ?? 0}
          </span>
        </div>
      </Card>
    </Link>
  );
}

/** 计算相对时间：刚刚 / N分钟前 / N小时前 / N天前 / 日期 */
function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}
