"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

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
      // 服务端抛出的具体错误信息（如"请先验证邮箱"），否则用默认提示
      const msg = result.error === "CredentialsSignin"
        ? "邮箱或密码错误"
        : result.error;
      setError(msg);
      setLoading(false);
    } else {
      router.push("/notes");
    }
  };

  return (
    <Card className="p-6">
      <h1 className="text-xl font-bold text-center mb-6">登录</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="邮箱"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
        <Input
          label="密码"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="输入密码"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "登录中..." : "登录"}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-4">
        还没有账号？{" "}
        <Link href="/register" className="text-emerald-600 hover:underline">
          注册
        </Link>
      </p>
    </Card>
  );
}
