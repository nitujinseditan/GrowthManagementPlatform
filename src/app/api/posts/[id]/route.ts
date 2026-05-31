import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getPostById, unpublishPost } from "@/lib/db/queries/posts";

// GET /api/posts/[id] — 公开接口，获取单个帖子
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id, 10);
    const post = await getPostById(postId);

    if (!post) {
      return NextResponse.json({ error: "帖子不存在" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "获取帖子失败" }, { status: 500 });
  }
}

// DELETE /api/posts/[id] — 下架帖子
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const postId = parseInt(params.id, 10);
    const deleted = await unpublishPost(postId, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: "帖子不存在或无权操作" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "下架失败" }, { status: 500 });
  }
}
