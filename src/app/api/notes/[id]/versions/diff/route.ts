import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { compareVersions } from "@/lib/version/diff";

// GET /api/notes/[id]/versions/diff?a=vid1&b=vid2 — 对比两个版本
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const noteId = parseInt(params.id, 10);

    const a = req.nextUrl.searchParams.get("a");
    const b = req.nextUrl.searchParams.get("b");

    if (!a || !b) {
      return NextResponse.json(
        { error: "请指定两个版本 ID：?a=vid1&b=vid2" },
        { status: 400 }
      );
    }

    const versionIdA = parseInt(a, 10);
    const versionIdB = parseInt(b, 10);

    const result = await compareVersions(versionIdA, versionIdB, noteId, userId);

    if (!result) {
      return NextResponse.json(
        { error: "版本不存在或无权访问" },
        { status: 404 }
      );
    }

    return NextResponse.json({ diff: result });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "对比版本失败" }, { status: 500 });
  }
}
