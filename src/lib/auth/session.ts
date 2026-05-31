import { auth } from ".";

// 服务端获取当前登录用户 ID
export async function getCurrentUserId(): Promise<number | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return parseInt(session.user.id, 10);
}

// 要求必须登录，否则抛出错误
export async function requireAuth(): Promise<number> {
  const userId = await getCurrentUserId();
  if (userId === null) {
    throw new Error("请先登录");
  }
  return userId;
}
