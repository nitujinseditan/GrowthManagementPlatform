import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { getVersions, saveVersion } from "@/lib/db/queries/versions";

const saveSchema = z.object({
  content: z.string(),
  commitMessage: z.string().optional(),
});

// GET /api/notes/[id]/versions — 获取版本历史
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const noteId = parseInt(params.id, 10);
    const versions = await getVersions(noteId, userId);

    return NextResponse.json({ versions });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "获取版本失败" }, { status: 500 });
  }
}

// POST /api/notes/[id]/versions — 保存新版本
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const noteId = parseInt(params.id, 10);
    const body = await req.json();
    const parsed = saveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const version = await saveVersion(
      noteId,
      userId,
      parsed.data.content,
      parsed.data.commitMessage
    );

    if (!version) {
      return NextResponse.json({ error: "笔记不存在" }, { status: 404 });
    }

    return NextResponse.json({ version }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "保存版本失败" }, { status: 500 });
  }
}
