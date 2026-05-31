"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Spinner from "@/components/ui/Spinner";
import type { AIMessage } from "@/types";

interface ChatPanelProps {
  noteId: number;
}

const SUGGESTED_QUESTIONS = [
  { icon: "🔍", text: "帮我复盘这篇笔记" },
  { icon: "💡", text: "提炼关键知识点" },
  { icon: "🎯", text: "制定一个行动计划" },
];

export default function ChatPanel({ noteId }: ChatPanelProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 初始化
  useEffect(() => {
    fetch(`/api/notes/${noteId}/ai/conversations`)
      .then((r) => r.json())
      .then((data) => {
        const conversations = data.conversations || [];
        if (conversations.length > 0) {
          const latest = conversations[conversations.length - 1];
          setConversationId(latest.id);
          return fetch(
            `/api/notes/${noteId}/ai/conversations/${latest.id}/messages`
          );
        } else {
          return fetch(`/api/notes/${noteId}/ai/conversations`, {
            method: "POST",
          }).then((r) => r.json());
        }
      })
      .then((data) => {
        if (data.messages) {
          setMessages(data.messages);
        } else if (data.conversation) {
          setConversationId(data.conversation.id);
        }
      })
      .finally(() => setInitLoading(false));
  }, [noteId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || !conversationId) return;
    setLoading(true);
    setInput("");

    const tempUserMsg: AIMessage = {
      id: Date.now(),
      conversationId,
      role: "user",
      content,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch(
        `/api/notes/${noteId}/ai/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        setMessages((prev) => [...prev, tempUserMsg, data.message]);
      }
    } catch {
      // 失败时保留用户消息
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = async () => {
    const res = await fetch(`/api/notes/${noteId}/ai/conversations`, {
      method: "POST",
    });
    const data = await res.json();
    setConversationId(data.conversation.id);
    setMessages([]);
  };

  if (initLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-stone-900 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50">
            <span className="text-sm">🤖</span>
          </span>
          AI 成长教练
        </h4>
        <Button variant="ghost" size="sm" onClick={handleNewConversation}>
          新对话
        </Button>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-3 rounded-xl p-4 bg-stone-50/50 border border-stone-100">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-stone-400 text-sm mb-1">
              和 AI 教练聊聊这篇笔记吧
            </p>
            <p className="text-stone-300 text-xs mb-4">
              我可以帮你复盘、梳理知识点、发现成长方向
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q.text}
                  onClick={() => handleSend(q.text)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-sm text-stone-600 hover:border-emerald-300 hover:text-emerald-700 transition-all disabled:opacity-50"
                >
                  <span>{q.icon}</span>
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            } animate-fade-in-up`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs mr-2 mt-1 shrink-0">
                🤖
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-500 text-white rounded-br-md shadow-sm"
                  : "bg-white border border-stone-200 text-stone-700 rounded-bl-md shadow-sm"
              }`}
            >
              {msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-xs ml-2 mt-1 shrink-0">
                👤
              </div>
            )}
          </div>
        ))}

        {/* AI 输入中指示器 */}
        {loading && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs mr-2 mt-1 shrink-0">
              🤖
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 输入区域 */}
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="向 AI 教练提问..."
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          size="sm"
          className="self-end"
        >
          {loading ? <Spinner size="sm" /> : "发送"}
        </Button>
      </div>
    </div>
  );
}
