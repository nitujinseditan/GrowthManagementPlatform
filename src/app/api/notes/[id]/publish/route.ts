import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { publishNote } from "@/lib/db/queries/posts";

const publishSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200),
  excerpt: z.string().optional(),
});

// POST /api/notes/[id]/publish — 发布笔记为公开帖子
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const noteId = parseInt(params.id, 10);
    const body = await req.json();
    const parsed = publishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const post = await publishNote(
      noteId,
      userId,
      parsed.data.title,
      parsed.data.excerpt
    );

    if (!post) {
      return NextResponse.json(
        { error: "笔记不存在或无权操作" },
        { status: 404 }
      );
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "发布失败" }, { status: 500 });
  }
}
