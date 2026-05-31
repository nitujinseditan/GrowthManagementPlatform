import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { initDb, saveToDisk } from "@/lib/db/init";
import { users, emailVerifications } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/utils";
import { sendVerificationEmail } from "@/lib/email/send";
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

    // 初始化数据库
    const db = await initDb();

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

    // 创建用户（email_verified 为 null，表示未验证）
    const passwordHash = await hashPassword(password);
    db.insert(users)
      .values({ email, name, passwordHash })
      .run();

    // 生成验证 token（32 字节随机字符串）
    const token = crypto.randomBytes(32).toString("hex");

    // 存入 email_verifications 表，10 分钟后过期
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    db.insert(emailVerifications)
      .values({ email, token, expiresAt })
      .run();

    // 持久化
    saveToDisk();

    // 发送验证邮件
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3722";
    await sendVerificationEmail({ to: email, token, appUrl });

    return NextResponse.json(
      { message: "验证邮件已发送，请查收邮箱并点击验证链接" },
      { status: 201 }
    );
  } catch (error) {
    console.error("注册失败:", error);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
