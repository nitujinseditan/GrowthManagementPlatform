import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import {
  getConversations,
  createConversation,
} from "@/lib/ai/conversation";

// GET /api/notes/[id]/ai/conversations — 获取对话列表
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const noteId = parseInt(params.id, 10);

    const conversations = getConversations(noteId, userId);
    return NextResponse.json({ conversations });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "获取对话失败" }, { status: 500 });
  }
}

// POST /api/notes/[id]/ai/conversations — 创建新对话
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const noteId = parseInt(params.id, 10);

    const conversation = createConversation(noteId, userId);
    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "创建对话失败" }, { status: 500 });
  }
}
