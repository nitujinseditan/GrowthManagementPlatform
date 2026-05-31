import { NextRequest, NextResponse } from "next/server";
import { getPublicPosts } from "@/lib/db/queries/posts";

// GET /api/posts — 公开接口，获取帖子列表
export async function GET(req: NextRequest) {
  try {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20", 10);

    const result = await getPublicPosts(page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error("获取帖子列表失败:", error);
    return NextResponse.json({ error: "获取帖子失败" }, { status: 500 });
  }
}
