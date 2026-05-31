import { initDb, saveToDisk } from "../init";
import { noteVersions, notes } from "../schema";
import { eq, and, desc, max } from "drizzle-orm";
import type { NoteVersion } from "@/types";

async function getDb() {
  return initDb();
}

// 获取笔记的所有版本
export async function getVersions(
  noteId: number,
  userId: number
): Promise<NoteVersion[]> {
  const db = await getDb();
  const note = db
    .select({ id: notes.id })
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .get();

  if (!note) return [];

  return db
    .select()
    .from(noteVersions)
    .where(eq(noteVersions.noteId, noteId))
    .orderBy(desc(noteVersions.versionNumber))
    .all();
}

// 保存新版本（Git 式 commit）
export async function saveVersion(
  noteId: number,
  userId: number,
  content: string,
  commitMessage?: string
): Promise<NoteVersion | null> {
  const db = await getDb();

  const note = db
    .select({ id: notes.id })
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .get();

  if (!note) return null;

  const maxRow = db
    .select({ maxVersion: max(noteVersions.versionNumber) })
    .from(noteVersions)
    .where(eq(noteVersions.noteId, noteId))
    .get();

  const newVersionNumber = (maxRow?.maxVersion ?? 0) + 1;

  const result = db
    .insert(noteVersions)
    .values({
      noteId,
      userId,
      versionNumber: newVersionNumber,
      content,
      commitMessage: commitMessage || null,
    })
    .returning()
    .get();

  db.update(notes)
    .set({ currentVersionId: result.id, updatedAt: new Date() })
    .where(eq(notes.id, noteId))
    .run();

  saveToDisk();

  return result;
}

// 回退到指定版本
export async function revertToVersion(
  noteId: number,
  userId: number,
  versionId: number
): Promise<NoteVersion | null> {
  const db = await getDb();
  const targetVersion = db
    .select()
    .from(noteVersions)
    .where(
      and(
        eq(noteVersions.id, versionId),
        eq(noteVersions.noteId, noteId)
      )
    )
    .get();

  if (!targetVersion) return null;

  return saveVersion(
    noteId,
    userId,
    targetVersion.content,
    `回退到版本 ${targetVersion.versionNumber}`
  );
}

// 获取单个版本
export async function getVersion(
  versionId: number,
  noteId: number,
  userId: number
): Promise<NoteVersion | null> {
  const db = await getDb();
  const note = db
    .select({ id: notes.id })
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .get();

  if (!note) return null;

  const row = db
    .select()
    .from(noteVersions)
    .where(
      and(
        eq(noteVersions.id, versionId),
        eq(noteVersions.noteId, noteId)
      )
    )
    .get();

  return row || null;
}
