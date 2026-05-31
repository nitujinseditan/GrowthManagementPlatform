import type { DiffLine, VersionDiff } from "@/types";
import { initDb } from "@/lib/db/init";
import { noteVersions, notes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// 计算两个文本的行级差异（动态导入 CommonJS 的 diff 库）
export async function computeDiff(
  textA: string,
  textB: string
): Promise<DiffLine[]> {
  const { diffLines } = await import("diff");
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

  const diff = await computeDiff(versionA.content, versionB.content);

  return { versionA, versionB, diff };
}
