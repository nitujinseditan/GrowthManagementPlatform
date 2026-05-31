import Link from "next/link";
import Card from "@/components/ui/Card";
import type { Post } from "@/types";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/community/${post.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
        <h3 className="font-medium text-gray-900 mb-1">{post.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{post.authorName}</span>
          <span>
            {new Date(post.createdAt).toLocaleDateString("zh-CN")}
            {post.commentCount !== undefined && (
              <> · {post.commentCount} 条评论</>
            )}
          </span>
        </div>
      </Card>
    </Link>
  );
}
