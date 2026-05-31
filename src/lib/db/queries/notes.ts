import { initDb, saveToDisk } from "../init";
import { notes, noteVersions, noteTags, tags } from "../schema";
import { eq, and, desc } from "drizzle-orm";
import { getOrCreateTags } from "./tags";
import type { Note, NoteVersion } from "@/types";

async function getDb() {
  return initDb();
}

// 获取笔记的标签
async function _getTagsForNote(noteId: number) {
  const db = await getDb();
  return db
    .select({ id: tags.id, name: tags.name })
    .from(noteTags)
    .innerJoin(tags, eq(noteTags.tagId, tags.id))
    .where(eq(noteTags.noteId, noteId))
    .all();
}

async function _getVersionById(versionId: number): Promise<NoteVersion | null> {
  const db = await getDb();
  const row = db
    .select()
    .from(noteVersions)
    .where(eq(noteVersions.id, versionId))
    .get();
  return row || null;
}

// 获取用户的所有笔记
export async function getNotesByUser(userId: number): Promise<Note[]> {
  const db = await getDb();
  const rows = db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.updatedAt))
    .all();

  const result: Note[] = [];
  for (const row of rows) {
    const noteTags = await _getTagsForNote(row.id);
    const currentVersion = row.currentVersionId
      ? await _getVersionById(row.currentVersionId)
      : null;
    result.push({
      ...row,
      tags: noteTags,
      currentVersion: currentVersion || undefined,
    });
  }
  return result;
}

// 获取单条笔记
export async function getNoteById(
  noteId: number,
  userId: number
): Promise<Note | null> {
  const db = await getDb();
  const row = db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .get();

  if (!row) return null;

  const noteTags = await _getTagsForNote(row.id);
  const currentVersion = row.currentVersionId
    ? await _getVersionById(row.currentVersionId)
    : null;

  return {
    ...row,
    tags: noteTags,
    currentVersion: currentVersion || undefined,
  };
}

// 创建笔记
export async function createNote(
  userId: number,
  title: string,
  content?: string,
  tagNames?: string[],
  commitMessage?: string
): Promise<Note> {
  const db = await getDb();

  // 插入笔记
  const noteResult = db
    .insert(notes)
    .values({ userId, title })
    .returning()
    .get();

  // 如果有内容，创建第一个版本
  if (content) {
    const versionResult = db
      .insert(noteVersions)
      .values({
        noteId: noteResult.id,
        userId,
        versionNumber: 1,
        content,
        commitMessage: commitMessage || "初始版本",
      })
      .returning()
      .get();

    db.update(notes)
      .set({ currentVersionId: versionResult.id })
      .where(eq(notes.id, noteResult.id))
      .run();
  }

  // 如果有标签
  if (tagNames && tagNames.length > 0) {
    const tagRecords = await getOrCreateTags(tagNames);
    for (const tag of tagRecords) {
      db.insert(noteTags)
        .values({ noteId: noteResult.id, tagId: tag.id })
        .run();
    }
  }

  saveToDisk();

  return getNoteById(noteResult.id, userId) as Promise<Note>;
}

// 更新笔记元数据
export async function updateNote(
  noteId: number,
  userId: number,
  data: { title?: string; isPublic?: boolean }
): Promise<Note | null> {
  const db = await getDb();
  const note = await getNoteById(noteId, userId);
  if (!note) return null;

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

  db.update(notes)
    .set(updateData)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .run();

  saveToDisk();

  return getNoteById(noteId, userId);
}

// 删除笔记
export async function deleteNote(
  noteId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  db.delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .run();
  saveToDisk();
  return true;
}

export { _getVersionById };
