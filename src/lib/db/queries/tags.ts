import { initDb } from "../init";
import { tags } from "../schema";
import { eq } from "drizzle-orm";
import type { Tag } from "@/types";

async function getDb() {
  return initDb();
}

// 获取所有标签
export async function getAllTags(): Promise<Tag[]> {
  const db = await getDb();
  return db.select().from(tags).all();
}

// 批量获取或创建标签
export async function getOrCreateTags(names: string[]): Promise<Tag[]> {
  const db = await getDb();
  const trimmed = names.map((n) => n.trim()).filter(Boolean);
  if (trimmed.length === 0) return [];

  const result: Tag[] = [];

  for (const name of trimmed) {
    let tag = db.select().from(tags).where(eq(tags.name, name)).get();
    if (!tag) {
      tag = db.insert(tags).values({ name }).returning().get();
    }
    result.push(tag);
  }

  return result;
}
