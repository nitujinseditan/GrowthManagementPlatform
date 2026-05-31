import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { getNotesByUser, createNote } from "@/lib/db/queries/notes";

const createNoteSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  commitMessage: z.string().optional(),
});

// GET /api/notes — 获取用户所有笔记
export async function GET() {
  try {
    const userId = await requireAuth();
    const notes = getNotesByUser(userId);
    return NextResponse.json({ notes });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "获取笔记失败" }, { status: 500 });
  }
}

// POST /api/notes — 创建笔记
export async function POST(req: Request) {
  try {
    const userId = await requireAuth();
    const body = await req.json();
    const parsed = createNoteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { title, content, tags, commitMessage } = parsed.data;
    const note = createNote(userId, title, content, tags, commitMessage);

    return NextResponse.json({ note }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "创建笔记失败" }, { status: 500 });
  }
}
