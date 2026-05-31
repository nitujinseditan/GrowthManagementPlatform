import { initDb, saveToDisk } from "../init";
import { posts, users, notes, comments, noteVersions } from "../schema";
import { eq, desc, count, and } from "drizzle-orm";
import type { Post } from "@/types";

async function getDb() {
  return initDb();
}

// 获取公开帖子列表
export async function getPublicPosts(
  page: number = 1,
  limit: number = 20
): Promise<{ posts: Post[]; total: number }> {
  const db = await getDb();
  const offset = (page - 1) * limit;

  const totalResult = db
    .select({ count: count() })
    .from(posts)
    .get();

  const rows = db
    .select({
      id: posts.id,
      userId: posts.userId,
      noteId: posts.noteId,
      title: posts.title,
      excerpt: posts.excerpt,
      createdAt: posts.createdAt,
      authorName: users.name,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset)
    .all();

  const enriched = rows.map((row) => {
    const commentCountResult = db
      .select({ count: count() })
      .from(comments)
      .where(eq(comments.postId, row.id))
      .get();

    return {
      ...row,
      commentCount: commentCountResult?.count ?? 0,
    };
  });

  return {
    posts: enriched,
    total: totalResult?.count ?? 0,
  };
}

// 获取单个帖子
export async function getPostById(postId: number): Promise<Post | null> {
  const db = await getDb();
  const row = db
    .select({
      id: posts.id,
      userId: posts.userId,
      noteId: posts.noteId,
      title: posts.title,
      excerpt: posts.excerpt,
      createdAt: posts.createdAt,
      authorName: users.name,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .where(eq(posts.id, postId))
    .get();

  if (!row) return null;

  const commentCountResult = db
    .select({ count: count() })
    .from(comments)
    .where(eq(comments.postId, row.id))
    .get();

  return {
    ...row,
    commentCount: commentCountResult?.count ?? 0,
  };
}

// 发布笔记为公开帖子
export async function publishNote(
  noteId: number,
  userId: number,
  title: string,
  excerpt?: string
): Promise<Post | null> {
  const db = await getDb();

  const note = db
    .select({ id: notes.id, title: notes.title, currentVersionId: notes.currentVersionId })
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .get();

  if (!note) return null;

  let finalExcerpt = excerpt || "";
  if (!finalExcerpt && note.currentVersionId) {
    const version = db
      .select({ content: noteVersions.content })
      .from(noteVersions)
      .where(eq(noteVersions.id, note.currentVersionId))
      .get();
    if (version) {
      finalExcerpt = version.content.slice(0, 200);
    }
  }

  const result = db
    .insert(posts)
    .values({ userId, noteId, title, excerpt: finalExcerpt })
    .returning()
    .get();

  db.update(notes)
    .set({ isPublic: true, updatedAt: new Date() })
    .where(eq(notes.id, noteId))
    .run();

  saveToDisk();

  return getPostById(result.id);
}

// 取消发布
export async function unpublishPost(
  postId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  const post = db
    .select()
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.userId, userId)))
    .get();

  if (!post) return false;

  db.delete(posts).where(eq(posts.id, postId)).run();
  db.update(notes)
    .set({ isPublic: false, updatedAt: new Date() })
    .where(eq(notes.id, post.noteId))
    .run();

  saveToDisk();
  return true;
}
