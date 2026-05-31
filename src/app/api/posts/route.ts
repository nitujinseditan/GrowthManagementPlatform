import { NextRequest, NextResponse } from "next/server";
import { getPublicPosts } from "@/lib/db/queries/posts";

// GET /api/posts — 公开接口，获取帖子列表（支持标签筛选）
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // 标签筛选：逗号分隔的 ID 列表，如 ?tags=1,2,3
    const tagsParam = searchParams.get("tags");
    const tagIds = tagsParam
      ? tagsParam
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => !isNaN(n))
      : undefined;

    const result = await getPublicPosts(page, limit, tagIds);

    return NextResponse.json(result);
  } catch (error) {
    console.error("获取帖子列表失败:", error);
    return NextResponse.json({ error: "获取帖子失败" }, { status: 500 });
  }
}
