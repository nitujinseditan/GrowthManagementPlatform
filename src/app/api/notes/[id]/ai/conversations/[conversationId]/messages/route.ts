import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { getMessages, sendMessage } from "@/lib/ai/conversation";

const messageSchema = z.object({
  content: z.string().min(1, "消息不能为空").max(2000),
});

// GET /api/notes/[id]/ai/conversations/[conversationId]/messages
export async function GET(
  req: Request,
  { params }: { params: { id: string; conversationId: string } }
) {
  try {
    await requireAuth();
    const conversationId = parseInt(params.conversationId, 10);

    const messages = await getMessages(conversationId);
    return NextResponse.json({ messages });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "获取消息失败" }, { status: 500 });
  }
}

// POST /api/notes/[id]/ai/conversations/[conversationId]/messages
export async function POST(
  req: Request,
  { params }: { params: { id: string; conversationId: string } }
) {
  try {
    const userId = await requireAuth();
    const conversationId = parseInt(params.conversationId, 10);
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const aiMessage = await sendMessage(
      conversationId,
      userId,
      parsed.data.content
    );

    if (!aiMessage) {
      return NextResponse.json(
        { error: "对话不存在或无权操作" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: aiMessage }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "发送消息失败" }, { status: 500 });
  }
}
