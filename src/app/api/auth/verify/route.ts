import { NextRequest, NextResponse } from "next/server";
import { initDb, saveToDisk } from "@/lib/db/init";
import { users, emailVerifications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/auth/verify?token=xxx — 邮箱验证
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(
      "<html><body style='font-family:system-ui;text-align:center;padding:48px'><h1 style='color:#ef4444'>❌ 无效的验证链接</h1><p>缺少验证 token</p></body></html>",
      { headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }

  try {
    const db = await initDb();

    // 查找 token 记录
    const record = db
      .select()
      .from(emailVerifications)
      .where(eq(emailVerifications.token, token))
      .get();

    if (!record) {
      return new NextResponse(
        "<html><body style='font-family:system-ui;text-align:center;padding:48px'><h1 style='color:#ef4444'>❌ 验证失败</h1><p>验证链接无效或已被使用</p></body></html>",
        { headers: { "content-type": "text/html; charset=utf-8" } }
      );
    }

    // 检查是否过期
    if (new Date() > new Date(record.expiresAt)) {
      // 删除过期记录
      db.delete(emailVerifications)
        .where(eq(emailVerifications.id, record.id))
        .run();
      saveToDisk();

      return new NextResponse(
        "<html><body style='font-family:system-ui;text-align:center;padding:48px'><h1 style='color:#ef4444'>❌ 验证链接已过期</h1><p>请重新注册以获取新的验证邮件</p></body></html>",
        { headers: { "content-type": "text/html; charset=utf-8" } }
      );
    }

    // 更新用户验证状态
    db.update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.email, record.email))
      .run();

    // 删除已使用的 token
    db.delete(emailVerifications)
      .where(eq(emailVerifications.id, record.id))
      .run();

    saveToDisk();

    // 返回成功页面
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>验证成功</title></head>
<body style="font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:48px;background:#f3f4f6">
  <div style="max-width:400px;margin:0 auto;background:#fff;padding:32px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
    <p style="font-size:48px;margin-bottom:16px">✅</p>
    <h1 style="color:#10b981;font-size:20px;margin-bottom:8px">邮箱验证成功！</h1>
    <p style="color:#666;font-size:14px;margin-bottom:24px">你的邮箱 ${record.email} 已验证通过</p>
    <a href="/login" style="display:inline-block;padding:10px 24px;background:#10b981;color:#fff;border-radius:8px;text-decoration:none;font-size:14px">前往登录</a>
  </div>
</body></html>`,
      { headers: { "content-type": "text/html; charset=utf-8" } }
    );
  } catch (error) {
    console.error("验证失败:", error);
    return new NextResponse(
      "<html><body style='font-family:system-ui;text-align:center;padding:48px'><h1 style='color:#ef4444'>❌ 服务器错误</h1><p>请稍后重试</p></body></html>",
      { headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }
}
