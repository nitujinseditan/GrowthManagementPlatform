import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { getNoteById, updateNote, deleteNote } from "@/lib/db/queries/notes";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isPublic: z.boolean().optional(),
});

// GET /api/notes/[id] — 获取单条笔记
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const noteId = parseInt(params.id, 10);
    const note = getNoteById(noteId, userId);

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

    const note = updateNote(noteId, userId, parsed.data);
    if (!note) {
      return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "更新笔记失败" }, { status: 500 });
  }
}

// DELETE /api/notes/[id] — 删除笔记
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const noteId = parseInt(params.id, 10);
    const deleted = deleteNote(noteId, userId);

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
