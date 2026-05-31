"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("两次密码不一致");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "注册失败");
      setLoading(false);
      return;
    }

    // 注册成功，显示验证提示（不再自动登录）
    setSuccess(data.message || "验证邮件已发送，请查收");
    setLoading(false);
  };

  return (
    <Card className="p-6">
      <h1 className="text-xl font-bold text-center mb-6">注册</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="昵称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="你的昵称"
          required
        />
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
          placeholder="至少6位"
          required
        />
        <Input
          label="确认密码"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="再次输入密码"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-emerald-700 text-sm">✅ {success}</p>
          </div>
        )}
        <Button type="submit" disabled={loading || !!success} className="w-full">
          {loading ? "注册中..." : success ? "已发送验证邮件" : "注册"}
        </Button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-4">
        已有账号？{" "}
        <Link href="/login" className="text-emerald-600 hover:underline">
          登录
        </Link>
      </p>
    </Card>
  );
}
