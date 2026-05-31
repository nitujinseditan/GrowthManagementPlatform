import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getVersion } from "@/lib/db/queries/versions";

// GET /api/notes/[id]/versions/[versionId] — 获取单个版本
export async function GET(
  req: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const userId = await requireAuth();
    const noteId = parseInt(params.id, 10);
    const versionId = parseInt(params.versionId, 10);

    const version = await getVersion(versionId, noteId, userId);

    if (!version) {
      return NextResponse.json({ error: "版本不存在" }, { status: 404 });
    }

    return NextResponse.json({ version });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "获取版本失败" }, { status: 500 });
  }
}
