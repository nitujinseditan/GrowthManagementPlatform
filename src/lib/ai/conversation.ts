import { initDb, saveToDisk } from "@/lib/db/init";
import { aiConversations, aiMessages, notes, noteVersions } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { sendChatMessage, buildNoteContext } from "./client";
import type { AIConversation, AIMessage } from "@/types";

async function getDb() {
  return initDb();
}

// 获取笔记的 AI 对话列表
export async function getConversations(
  noteId: number,
  userId: number
): Promise<AIConversation[]> {
  const db = await getDb();
  return db
    .select()
    .from(aiConversations)
    .where(
      and(
        eq(aiConversations.noteId, noteId),
        eq(aiConversations.userId, userId)
      )
    )
    .orderBy(aiConversations.createdAt)
    .all();
}

// 创建新对话
export async function createConversation(
  noteId: number,
  userId: number
): Promise<AIConversation> {
  const db = await getDb();
  const result = db
    .insert(aiConversations)
    .values({ noteId, userId })
    .returning()
    .get();
  saveToDisk();
  return result;
}

// 获取对话中的消息
export async function getMessages(conversationId: number): Promise<AIMessage[]> {
  const db = await getDb();
  const rows = db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, conversationId))
    .orderBy(asc(aiMessages.createdAt))
    .all();

  return rows as AIMessage[];
}

// 发送消息并获取 AI 回复
export async function sendMessage(
  conversationId: number,
  userId: number,
  content: string
): Promise<AIMessage | null> {
  const db = await getDb();

  const conversation = db
    .select()
    .from(aiConversations)
    .where(
      and(
        eq(aiConversations.id, conversationId),
        eq(aiConversations.userId, userId)
      )
    )
    .get();

  if (!conversation) return null;

  const note = db
    .select({
      title: notes.title,
      currentVersionId: notes.currentVersionId,
    })
    .from(notes)
    .where(eq(notes.id, conversation.noteId))
    .get();

  let noteContent = "";
  if (note?.currentVersionId) {
    const version = db
      .select({ content: noteVersions.content })
      .from(noteVersions)
      .where(eq(noteVersions.id, note.currentVersionId))
      .get();
    noteContent = version?.content || "";
  }

  // 保存用户消息
  db.insert(aiMessages)
    .values({ conversationId, role: "user", content })
    .run();

  // 获取历史消息
  const history = await getMessages(conversationId);

  // 构建消息列表
  const contextMessage = buildNoteContext(note?.title || "未命名笔记", noteContent);
  const messages: { role: "user" | "assistant" | "system"; content: string }[] = [
    { role: "system", content: contextMessage },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // 调用 AI
  const aiResponse = await sendChatMessage(messages);

  // 保存 AI 回复
  const result = db
    .insert(aiMessages)
    .values({ conversationId, role: "assistant", content: aiResponse })
    .returning()
    .get();

  saveToDisk();

  return result as AIMessage;
}
