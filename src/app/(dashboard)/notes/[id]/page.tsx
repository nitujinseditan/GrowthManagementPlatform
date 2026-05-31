"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import NoteEditor from "@/components/notes/NoteEditor";
import VersionHistory from "@/components/notes/VersionHistory";
import DiffView from "@/components/notes/DiffView";
import ChatPanel from "@/components/ai/ChatPanel";
import PublishDialog from "@/components/community/PublishDialog";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import type { Note } from "@/types";

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = parseInt(params.id as string, 10);

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"edit" | "versions" | "ai">("edit");
  const [diffA, setDiffA] = useState<number | null>(null);
  const [diffB, setDiffB] = useState<number | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "versions" || tabParam === "ai" || tabParam === "edit") {
      setTab(tabParam);
    }
  }, [searchParams]);

  const loadNote = useCallback(() => {
    fetch(`/api/notes/${noteId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.note) setNote(data.note);
      })
      .finally(() => setLoading(false));
  }, [noteId]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const handleSave = async (
    title: string,
    content: string,
    commitMessage: string,
    tags: string[]
  ) => {
    setSaving(true);
    await fetch(`/api/notes/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, tags }),
    });
    await fetch(`/api/notes/${noteId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, commitMessage }),
    });
    setSaving(false);
    loadNote();
  };

  const handleCompare = (versionIdA: number, versionIdB: number) => {
    setDiffA(versionIdA);
    setDiffB(versionIdB);
  };

  const handleRevert = async (versionId: number) => {
    const res = await fetch(
      `/api/notes/${noteId}/versions/${versionId}/revert`,
      { method: "POST" }
    );
    if (res.ok) {
      loadNote();
    }
  };

  const handlePublish = async (title: string, excerpt: string) => {
    setPublishing(true);
    const res = await fetch(`/api/notes/${noteId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, excerpt }),
    });
    if (res.ok) {
      setPublishOpen(false);
      loadNote();
    }
    setPublishing(false);
  };

  const handleDelete = async () => {
    if (!confirm("确定要删除这篇笔记吗？所有版本记录将被永久删除。"))
      return;
    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/notes");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-stone-500">笔记不存在</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push("/notes")}
        >
          ← 返回列表
        </Button>
      </div>
    );
  }

  const tabs = [
    { key: "edit" as const, label: "编辑", icon: "✏️" },
    { key: "versions" as const, label: "版本历史", icon: "📋" },
    { key: "ai" as const, label: "AI 教练", icon: "🤖" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <button
          onClick={() => router.push("/notes")}
          className="text-sm text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1 shrink-0"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPublishOpen(true)}
          >
            {note.isPublic ? "✅ 已发布" : "📤 发布到社区"}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            🗑️
          </Button>
        </div>
      </div>

      {/* Tab 切换 — 带滑动指示条 */}
      <div className="relative flex gap-0 mb-6 border-b border-stone-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative px-5 py-3 text-sm font-medium transition-colors shrink-0
              ${
                tab === t.key
                  ? "text-emerald-600"
                  : "text-stone-400 hover:text-stone-600"
              }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="text-base">{t.icon}</span>
              {t.label}
            </span>
            {tab === t.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      {tab === "edit" && (
        <Card className="p-6">
          <NoteEditor note={note} onSave={handleSave} saving={saving} />
        </Card>
      )}

      {tab === "versions" && (
        <Card className="p-6">
          {diffA && diffB ? (
            <DiffView
              noteId={noteId}
              versionIdA={diffA}
              versionIdB={diffB}
              onClose={() => {
                setDiffA(null);
                setDiffB(null);
              }}
            />
          ) : (
            <VersionHistory
              noteId={noteId}
              onCompare={handleCompare}
              onRevert={handleRevert}
            />
          )}
        </Card>
      )}

      {tab === "ai" && (
        <Card className="p-6">
          <ChatPanel noteId={noteId} />
        </Card>
      )}

      <PublishDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        noteTitle={note.title}
        noteContent={note.currentVersion?.content || ""}
        onPublish={handlePublish}
        publishing={publishing}
      />
    </div>
  );
}
