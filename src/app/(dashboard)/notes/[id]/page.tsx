"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import NoteEditor from "@/components/notes/NoteEditor";
import VersionHistory from "@/components/notes/VersionHistory";
import DiffView from "@/components/notes/DiffView";
import ChatPanel from "@/components/ai/ChatPanel";
import PublishDialog from "@/components/community/PublishDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  // 导航守卫：未保存更改提醒
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const dirtyRef = useRef(false);
  dirtyRef.current = isDirty;

  // 执行挂起的导航
  const executeNavigation = useCallback(
    (url: string | null) => {
      if (!url) return;
      if (url === "back") {
        window.history.back();
      } else {
        router.push(url);
      }
    },
    [router]
  );

  // 对话框: 保存并离开 — 通过触发 Ctrl+S 让 NoteEditor 处理保存
  const handleLeaveSave = useCallback(() => {
    setShowLeaveDialog(false);
    // 保持 pendingUrl，等 isDirty 变为 false 后自动导航
    // 触发 Ctrl+S 让 NoteEditor 的快捷键 handler 执行保存
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        ctrlKey: true,
        key: "s",
        bubbles: true,
      })
    );
  }, []);

  // 对话框: 不保存离开
  const handleLeaveDiscard = useCallback(() => {
    setShowLeaveDialog(false);
    const url = pendingUrl;
    setPendingUrl(null);
    setIsDirty(false);
    // 直接导航离开（对于后退触发的，push 到 /notes 代替 history.back，简化虚拟条目清理）
    if (url === "back") {
      router.push("/notes");
    } else if (url) {
      router.push(url);
    }
  }, [pendingUrl, router]);

  // 对话框: 取消
  const handleLeaveCancel = useCallback(() => {
    setShowLeaveDialog(false);
    const wasBack = pendingUrl === "back";
    setPendingUrl(null);
    // 如果是从后退触发的，重新注入虚拟历史条目
    if (wasBack) {
      window.history.pushState(null, "", window.location.href);
    }
  }, [pendingUrl]);

  // 第 1 层守卫：beforeunload（关闭标签页/刷新）
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // 现代浏览器会忽略自定义消息，但 preventDefault 会触发原生对话框
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // 第 2 层守卫：全局 click 拦截（捕获阶段 — 侧边栏/移动端导航/返回按钮等）
  useEffect(() => {
    if (!isDirty) return;

    const handleClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest("a[href]");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      // 排除外链、锚点、新窗口、下载链接
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("#") ||
        link.getAttribute("target") === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      // 排除当前页面自身的链接（如 Tab 切换）
      try {
        const url = new URL(href, window.location.origin);
        if (url.pathname === window.location.pathname) return;
      } catch {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      setPendingUrl(href);
      setShowLeaveDialog(true);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isDirty]);

  // 追踪是否向历史注入了虚拟条目
  const popStatePushed = useRef(false);

  // 第 3 层守卫：popstate（浏览器后退/前进）
  useEffect(() => {
    if (!isDirty) {
      // 变为干净状态：如果之前注入了虚拟条目，移除它
      if (popStatePushed.current) {
        popStatePushed.current = false;
        window.history.back();
      }
      return;
    }

    // 注入虚拟历史条目
    window.history.pushState(null, "", window.location.href);
    popStatePushed.current = true;

    const handlePopState = () => {
      // 重新注入以保持拦截
      window.history.pushState(null, "", window.location.href);
      setPendingUrl("back");
      setShowLeaveDialog(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty]);

  // isDirty 清除后自动执行挂起的"保存并离开"导航
  useEffect(() => {
    if (!isDirty && pendingUrl && !showLeaveDialog) {
      const url = pendingUrl;
      setPendingUrl(null);
      executeNavigation(url);
    }
  }, [isDirty, pendingUrl, showLeaveDialog, executeNavigation]);

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
    tags: string[],
    contentHtml?: string
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
      body: JSON.stringify({ content, contentHtml, commitMessage }),
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (dirtyRef.current) {
              setPendingUrl("/notes");
              setShowLeaveDialog(true);
            } else {
              router.push("/notes");
            }
          }}
          className="shrink-0"
        >
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </Button>
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

      {/* Tab 切换 */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as "edit" | "versions" | "ai")}>
        <TabsList className="mb-6">
          <TabsTrigger value="edit" className="gap-1.5">
            <span>✏️</span> 编辑
          </TabsTrigger>
          <TabsTrigger value="versions" className="gap-1.5">
            <span>📋</span> 版本历史
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <span>🤖</span> AI 教练
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <Card className="p-6">
            <NoteEditor note={note} onSave={handleSave} saving={saving} onDirtyChange={setIsDirty} />
          </Card>
        </TabsContent>

        <TabsContent value="versions">
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
        </TabsContent>

        <TabsContent value="ai">
          <Card className="p-6">
            <ChatPanel noteId={noteId} />
          </Card>
        </TabsContent>
      </Tabs>

      <PublishDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        noteTitle={note.title}
        noteContent={note.currentVersion?.content || ""}
        onPublish={handlePublish}
        publishing={publishing}
      />

      {/* 未保存更改确认对话框 */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <span className="text-xl">⚠️</span>
              未保存的更改
            </DialogTitle>
            <DialogDescription className="text-stone-500">
              你有未保存的更改，离开前是否保存？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="default"
              onClick={handleLeaveSave}
              className="flex-1"
            >
              💾 保存并离开
            </Button>
            <Button
              variant="outline"
              onClick={handleLeaveDiscard}
              className="flex-1"
            >
              🗑️ 不保存离开
            </Button>
            <Button
              variant="ghost"
              onClick={handleLeaveCancel}
              className="flex-1"
            >
              取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
