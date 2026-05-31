import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/notes");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">🧠 成长第二大脑</h1>
        <p className="text-gray-500 mb-8 text-lg">
          私密沉淀 · 智能复盘 · 有根分享
        </p>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          一站式个人成长管理平台。用 Git 式版本管理你的每一次思考，
          让 AI 教练帮你诊断盲点，把沉淀的知识有根分享出去。
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-blue-600 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-blue-700 transition-colors"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="bg-gray-100 text-gray-700 rounded-lg px-6 py-2.5 font-medium hover:bg-gray-200 transition-colors border border-gray-300"
          >
            注册
          </Link>
        </div>
      </div>
    </main>
  );
}
