import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { getComments, createComment } from "@/lib/db/queries/comments";

const createSchema = z.object({
  content: z.string().min(1, "评论不能为空").max(2000),
});

// GET /api/posts/[id]/comments — 公开接口，获取评论
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = parseInt(params.id, 10);
    const comments = await getComments(postId);
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ error: "获取评论失败" }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments — 发表评论（需登录）
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const postId = parseInt(params.id, 10);
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const comment = await createComment(postId, userId, parsed.data.content);
    return NextResponse.json({ comment }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "发表评论失败" }, { status: 500 });
  }
}
