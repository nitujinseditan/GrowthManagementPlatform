import { NextResponse } from "next/server";
import { getAllTags } from "@/lib/db/queries/tags";

// GET /api/tags — 获取所有标签
export async function GET() {
  try {
    const tags = await getAllTags();
    return NextResponse.json({ tags });
  } catch {
    return NextResponse.json({ error: "获取标签失败" }, { status: 500 });
  }
}
