"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // 即时校验：两次密码不一致
  const handleConfirmPasswordBlur = () => {
    if (confirmPassword && password !== confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: "两次密码不一致",
      }));
    } else {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.confirmPassword;
        return next;
      });
    }
  };

  // 即时校验：密码强度
  const handlePasswordBlur = () => {
    if (password && password.length < 6) {
      setFieldErrors((prev) => ({
        ...prev,
        password: "密码至少需要 6 位",
      }));
    } else {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.password;
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: "两次密码不一致",
      }));
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

    setSuccess(data.message || "验证邮件已发送，请查收");
    setLoading(false);
  };

  // 注册成功 — 全屏成功状态卡片
  if (success) {
    return (
      <Card className="shadow-lg p-8 text-center animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4">
          <svg
            className="h-8 w-8 text-emerald-500 animate-success-pop"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          验证邮件已发送 ✉️
        </h2>
        <p className="text-sm text-stone-500 mb-1">
          我们向 <span className="text-emerald-600 font-medium">{email}</span> 发送了一封验证邮件
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          请查收邮件并点击验证链接（10分钟内有效）
        </p>
        <Link href="/login">
          <Button variant="secondary" className="w-full">
            去登录
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg p-8 animate-fade-in-up">
      {/* 品牌标志 */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 mb-4">
          <span className="text-2xl">🌱</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">创建账号</h1>
        <div className="w-10 h-0.5 bg-emerald-400 mx-auto mt-2 rounded-full" />
        <p className="text-sm text-muted-foreground mt-2">开始你的成长之旅</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="昵称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="你的昵称"
          required
          autoComplete="name"
        />
        <Input
          label="邮箱"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          autoComplete="email"
        />
        <div>
          <Input
            label="密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={handlePasswordBlur}
            placeholder="至少6位"
            required
            error={fieldErrors.password}
            autoComplete="new-password"
          />
          {password.length > 0 && !fieldErrors.password && (
            <div className="flex gap-1 mt-1.5">
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${
                  password.length >= 6 ? "bg-emerald-400" : "bg-stone-200"
                }`}
              />
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${
                  password.length >= 8 ? "bg-emerald-400" : "bg-stone-200"
                }`}
              />
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${
                  /(?=.*[A-Za-z])(?=.*\d)/.test(password)
                    ? "bg-emerald-400"
                    : "bg-stone-200"
                }`}
              />
            </div>
          )}
        </div>
        <Input
          label="确认密码"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={handleConfirmPasswordBlur}
          placeholder="再次输入密码"
          required
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
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
              注册中...
            </span>
          ) : (
            "注册"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        已有账号？{" "}
        <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
          登录
        </Link>
      </p>
    </Card>
  );
}
