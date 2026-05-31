import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/init";
import { users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/utils";
import { eq } from "drizzle-orm";

const registerSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  name: z.string().min(1, "昵称不能为空").max(50),
  password: z.string().min(6, "密码至少6位"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, name, password } = parsed.data;

    // 检查邮箱是否已注册
    const existing = db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (existing) {
      return NextResponse.json(
        { error: "该邮箱已注册" },
        { status: 409 }
      );
    }

    // 创建用户
    const passwordHash = await hashPassword(password);
    const user = db
      .insert(users)
      .values({ email, name, passwordHash })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .get();

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("注册失败:", error);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
