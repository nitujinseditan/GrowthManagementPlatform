"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      const msg =
        result.error === "CredentialsSignin"
          ? "邮箱或密码错误"
          : result.error;
      setError(msg);
      setLoading(false);
    } else {
      router.push("/notes");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-stone-200/50 border border-stone-100 p-8 animate-fade-in-up">
      {/* 品牌标志 */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 mb-4">
          <span className="text-2xl">🧠</span>
        </div>
        <h1 className="text-xl font-bold text-stone-900">欢迎回来</h1>
        <div className="w-10 h-0.5 bg-emerald-400 mx-auto mt-2 rounded-full" />
        <p className="text-sm text-stone-400 mt-2">登录你的成长空间</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="邮箱"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          autoComplete="email"
        />
        <Input
          label="密码"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="输入密码"
          required
          autoComplete="current-password"
        />

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 flex items-start gap-2">
            <svg className="h-4 w-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              登录中...
            </span>
          ) : (
            "登录"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-stone-400 mt-6">
        还没有账号？{" "}
        <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
          注册
        </Link>
      </p>
    </div>
  );
}
