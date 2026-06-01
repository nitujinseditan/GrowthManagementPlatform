import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/notes");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 animate-fade-in-up">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">🧠 成长第二大脑</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          私密沉淀 · 智能复盘 · 有根分享
        </p>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          一站式个人成长管理平台。用 Git 式版本管理你的每一次思考，
          让 AI 教练帮你诊断盲点，把沉淀的知识有根分享出去。
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild variant="gradient" size="lg">
            <Link href="/login">登录</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/register">注册</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
