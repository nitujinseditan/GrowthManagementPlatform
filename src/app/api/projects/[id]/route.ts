import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { updateProject, deleteProject, moveProject } from "@/lib/db/queries/projects";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().max(4).optional(),
  sortOrder: z.number().optional(),
});

const moveSchema = z.object({
  parentId: z.number().nullable(),
});

// PATCH /api/projects/[id] — 更新项目
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const projectId = parseInt(params.id, 10);
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const project = await updateProject(projectId, userId, parsed.data);
    if (!project) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "更新项目失败" }, { status: 500 });
  }
}

// DELETE /api/projects/[id] — 删除项目
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const projectId = parseInt(params.id, 10);
    await deleteProject(projectId, userId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "删除项目失败" }, { status: 500 });
  }
}

// PUT /api/projects/[id] — 移动项目
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const projectId = parseInt(params.id, 10);
    const body = await req.json();
    const parsed = moveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const success = await moveProject(projectId, userId, parsed.data.parentId);
    if (!success) {
      return NextResponse.json({ error: "不能将项目移到自身下" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "移动项目失败" }, { status: 500 });
  }
}
