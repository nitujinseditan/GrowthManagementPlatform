import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { getNoteById, updateNote, softDeleteNote, restoreNote, setNoteTags } from "@/lib/db/queries/notes";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isPublic: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  description: z.string().max(500).optional(),
  coverImageUrl: z.string().max(500).optional(),
  icon: z.string().max(10).optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/notes/[id] — 获取单条笔记
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const noteId = parseInt(params.id, 10);
    const note = await getNoteById(noteId, userId);

    if (!note) {
      return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "获取笔记失败" }, { status: 500 });
  }
}

// PATCH /api/notes/[id] — 更新笔记元数据
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const noteId = parseInt(params.id, 10);
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // 更新标签（如果提供）
    if (parsed.data.tags !== undefined) {
      await setNoteTags(noteId, parsed.data.tags);
    }

    // 更新标题等元数据（排除 tags 字段）
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tags: _tags, ...meta } = parsed.data;
    const note = await updateNote(noteId, userId, meta);
    if (!note) {
      return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
    }

    // 重新加载以包含最新标签
    const updated = await getNoteById(noteId, userId);
    return NextResponse.json({ note: updated });
  } catch (error: unknown) {
    console.error("PATCH /api/notes/[id] 错误:", error);
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "更新笔记失败" }, { status: 500 });
  }
}

// DELETE /api/notes/[id] — 软删除笔记（移入回收站）
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const noteId = parseInt(params.id, 10);
    const deleted = await softDeleteNote(noteId, userId);

    if (!deleted) {
      return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "删除笔记失败" }, { status: 500 });
  }
}

// PUT /api/notes/[id]/restore — 从回收站恢复
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const noteId = parseInt(params.id, 10);

    // 检查是否是恢复操作
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "restore") {
      await restoreNote(noteId, userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "未知操作" }, { status: 400 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
