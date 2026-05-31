import { initDb, saveToDisk } from "../init";
import { comments, users } from "../schema";
import { eq, and } from "drizzle-orm";
import type { Comment } from "@/types";

async function getDb() {
  return initDb();
}

// 获取帖子的评论
export async function getComments(postId: number): Promise<Comment[]> {
  const db = await getDb();
  return db
    .select({
      id: comments.id,
      postId: comments.postId,
      userId: comments.userId,
      content: comments.content,
      createdAt: comments.createdAt,
      authorName: users.name,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(comments.createdAt)
    .all();
}

// 创建评论
export async function createComment(
  postId: number,
  userId: number,
  content: string
): Promise<Comment> {
  const db = await getDb();
  const result = db
    .insert(comments)
    .values({ postId, userId, content })
    .returning()
    .get();

  const user = db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  saveToDisk();

  return {
    ...result,
    authorName: user?.name || "未知用户",
  };
}

// 删除评论
export async function deleteComment(
  commentId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  db.delete(comments)
    .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
    .run();
  saveToDisk();
  return true;
}
