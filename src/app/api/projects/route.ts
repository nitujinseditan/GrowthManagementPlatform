import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { getProjectTree, createProject } from "@/lib/db/queries/projects";

const createSchema = z.object({
  name: z.string().min(1, "名称不能为空").max(100),
  parentId: z.number().nullable().optional(),
  icon: z.string().max(4).optional(),
});

// GET /api/projects — 获取项目树
export async function GET() {
  try {
    const userId = await requireAuth();
    const tree = await getProjectTree(userId);
    return NextResponse.json({ projects: tree });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "获取项目失败" }, { status: 500 });
  }
}

// POST /api/projects — 创建项目
export async function POST(req: Request) {
  try {
    const userId = await requireAuth();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, parentId, icon } = parsed.data;
    const project = await createProject(userId, name, parentId, icon);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "请先登录") {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ error: "创建项目失败" }, { status: 500 });
  }
}
