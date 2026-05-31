import { diffLines } from "diff";
import type { DiffLine, VersionDiff } from "@/types";
import { initDb } from "@/lib/db/init";
import { noteVersions, notes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// 计算两个文本的行级差异
export function computeDiff(textA: string, textB: string): DiffLine[] {
  const changes = diffLines(textA, textB);
  return changes.map((change) => ({
    type: change.added
      ? "added"
      : change.removed
        ? "removed"
        : "unchanged",
    value: change.value,
  }));
}

// 对比两个版本
export async function compareVersions(
  versionIdA: number,
  versionIdB: number,
  noteId: number,
  userId: number
): Promise<VersionDiff | null> {
  const db = await initDb();

  const note = db
    .select({ id: notes.id })
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .get();

  if (!note) return null;

  const versionA = db
    .select()
    .from(noteVersions)
    .where(
      and(eq(noteVersions.id, versionIdA), eq(noteVersions.noteId, noteId))
    )
    .get();

  const versionB = db
    .select()
    .from(noteVersions)
    .where(
      and(eq(noteVersions.id, versionIdB), eq(noteVersions.noteId, noteId))
    )
    .get();

  if (!versionA || !versionB) return null;

  const diff = computeDiff(versionA.content, versionB.content);

  return { versionA, versionB, diff };
}
