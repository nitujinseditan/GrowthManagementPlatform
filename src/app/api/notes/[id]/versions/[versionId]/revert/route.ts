import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { revertToVersion } from "@/lib/db/queries/versions";

// POST /api/notes/[id]/versions/[versionId]/revert — 回退到指定版本
export async function POST(
  req: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const userId = await requireAuth();
    const noteId = parseInt(params.id, 10);
    const versionId = parseInt(params.versionId, 10);

    const newVersion = await revertToVersion(noteId, userId, versionId);

    if (!newVersion) {
      return NextResponse.json(
        { error: "版本不存在或无权操作" },
        { status: 404 }
      );
    }

    return NextResponse.json({ version: newVersion }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "回退失败" }, { status: 500 });
  }
}
