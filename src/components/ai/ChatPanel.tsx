"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import Spinner from "@/components/ui/Spinner";
import type { AIMessage } from "@/types";

interface ChatPanelProps {
  noteId: number;
}

export default function ChatPanel({ noteId }: ChatPanelProps) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 初始化：加载或创建对话
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

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;
    setLoading(true);
    const content = input.trim();
    setInput("");

    // 乐观更新用户消息
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
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">AI 成长教练</h4>
        <Button variant="ghost" size="sm" onClick={handleNewConversation}>
          新对话
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 border rounded-lg p-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center py-8 text-sm">
            和 AI 教练聊聊这篇笔记吧！我可以帮你复盘、梳理知识点、发现成长方向。
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
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
          onClick={handleSend}
          disabled={loading || !input.trim()}
          size="sm"
        >
          {loading ? <Spinner /> : "发送"}
        </Button>
      </div>
    </div>
  );
}
