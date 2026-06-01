import { initDb, saveToDisk } from "../init";
import { projects, notes } from "../schema";
import { eq, and, asc } from "drizzle-orm";

async function getDb() {
  return initDb();
}

export interface ProjectNode {
  id: number;
  userId: number;
  name: string;
  parentId: number | null;
  icon: string | null;
  sortOrder: number;
  createdAt: Date;
  children?: ProjectNode[];
}

// 获取用户的所有项目（平铺列表）
export async function getProjects(userId: number): Promise<ProjectNode[]> {
  const db = await getDb();
  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(asc(projects.sortOrder), asc(projects.createdAt))
    .all();
}

// 获取项目树（递归构建）
export async function getProjectTree(userId: number): Promise<ProjectNode[]> {
  const all = await getProjects(userId);
  return buildTree(all);
}

// 将平铺列表构建为树
function buildTree(list: ProjectNode[], parentId: number | null = null): ProjectNode[] {
  return list
    .filter((p) => p.parentId === parentId)
    .map((p) => ({
      ...p,
      children: buildTree(list, p.id),
    }));
}

// 创建项目
export async function createProject(
  userId: number,
  name: string,
  parentId?: number | null,
  icon?: string
): Promise<ProjectNode> {
  const db = await getDb();

  // 获取当前最大排序值
  const maxRow = db
    .select({ maxSort: projects.sortOrder })
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(asc(projects.sortOrder))
    .all();

  const nextSort = maxRow.length > 0 ? Math.max(...maxRow.map((r) => r.maxSort)) + 1 : 0;

  const result = db
    .insert(projects)
    .values({
      userId,
      name,
      parentId: parentId || null,
      icon: icon || null,
      sortOrder: nextSort,
    })
    .returning()
    .get();

  saveToDisk();
  return result;
}

// 更新项目
export async function updateProject(
  projectId: number,
  userId: number,
  data: { name?: string; icon?: string; sortOrder?: number }
): Promise<ProjectNode | null> {
  const db = await getDb();

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

  if (Object.keys(updateData).length === 0) return null;

  db.update(projects)
    .set(updateData)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .run();

  saveToDisk();

  const row = db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .get();

  return row || null;
}

// 删除项目（级联删除子项目，笔记 project_id 设为 null）
export async function deleteProject(
  projectId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();

  // 先将归属该项目的笔记的 project_id 设为 null
  db.update(notes)
    .set({ projectId: null })
    .where(and(eq(notes.projectId, projectId), eq(notes.userId, userId)))
    .run();

  // 删除项目（ON DELETE CASCADE 会级联删除子项目）
  db.delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .run();

  saveToDisk();
  return true;
}

// 移动项目到新的父级
export async function moveProject(
  projectId: number,
  userId: number,
  newParentId: number | null
): Promise<boolean> {
  const db = await getDb();

  // 防止将项目移到自己或自己的子项目下
  if (newParentId === projectId) return false;

  db.update(projects)
    .set({ parentId: newParentId })
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .run();

  saveToDisk();
  return true;
}
