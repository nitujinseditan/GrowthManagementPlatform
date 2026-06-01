"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ProjectNode {
  id: number;
  name: string;
  parentId: number | null;
  icon: string | null;
  sortOrder: number;
  children?: ProjectNode[];
}

interface ProjectTreeProps {
  /** 外部传入的项目树数据，不传则自动获取 */
  projects?: ProjectNode[];
  /** 项目数据变化回调 */
  onChange?: () => void;
}

export default function ProjectTree({ projects: externalProjects, onChange }: ProjectTreeProps) {
  const [projects, setProjects] = useState<ProjectNode[]>(externalProjects || []);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const searchParams = useSearchParams();
  const activeProjectId = searchParams.get("project");

  // 获取项目树
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch { /* 静默 */ }
  }, []);

  useEffect(() => {
    if (!externalProjects) {
      fetchProjects();
    } else {
      setProjects(externalProjects);
    }
  }, [externalProjects, fetchProjects]);

  // 创建项目
  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      setCreating(false);
      return;
    }
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setNewName("");
        setCreating(false);
        fetchProjects();
        onChange?.();
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("创建项目失败:", data.error || res.statusText);
      }
    } catch (err) {
      console.error("创建项目失败:", err);
    }
  };

  // 重命名项目
  const handleRename = async (projectId: number) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        setEditingId(null);
        setEditName("");
        fetchProjects();
        onChange?.();
      }
    } catch { /* 静默 */ }
  };

  // 删除项目
  const handleDelete = async (projectId: number, name: string) => {
    if (!confirm(`确定删除项目「${name}」吗？项目下的笔记不会被删除。`)) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (res.ok) {
        fetchProjects();
        onChange?.();
      }
    } catch { /* 静默 */ }
  };

  // 切换展开/折叠
  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 递归渲染项目节点
  const renderNode = (node: ProjectNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    const isActive = activeProjectId === String(node.id);

    return (
      <div key={node.id}>
        <div
          className={cn(
            "group flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors",
            isActive
              ? "bg-emerald-50 text-emerald-700"
              : "text-muted-foreground hover:text-foreground hover:bg-white/60"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {/* 展开/折叠箭头 */}
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(node.id)}
              className="shrink-0 w-4 h-4 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors"
            >
              <svg
                className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <span className="w-4 h-4" />
          )}

          {/* 图标 + 名称 */}
          {editingId === node.id ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename(node.id);
                if (e.key === "Escape") setEditingId(null);
              }}
              onBlur={() => handleRename(node.id)}
              className="h-6 text-xs px-1 py-0 flex-1 min-w-0"
              autoFocus
            />
          ) : (
            <Link
              href={`/notes?project=${node.id}`}
              className="flex items-center gap-1.5 flex-1 min-w-0 truncate"
            >
              <span className="shrink-0 text-sm">{node.icon || "📁"}</span>
              <span className="truncate">{node.name}</span>
            </Link>
          )}

          {/* 操作按钮 */}
          {editingId !== node.id && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
              <button
                onClick={() => {
                  setEditingId(node.id);
                  setEditName(node.name);
                }}
                className="w-5 h-5 flex items-center justify-center rounded text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                title="重命名"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(node.id, node.name)}
                className="w-5 h-5 flex items-center justify-center rounded text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="删除"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 子项目 */}
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {/* 项目列表 */}
      {projects.length > 0 ? (
        projects.map((p) => renderNode(p))
      ) : (
        <p className="text-xs text-muted-foreground px-2 py-1">暂无项目</p>
      )}

      {/* 新建项目 */}
      {creating ? (
        <div className="px-2 py-1">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") { setCreating(false); setNewName(""); }
            }}
            onBlur={() => { handleCreate(); }}
            placeholder="项目名称..."
            className="h-7 text-xs px-2 py-0"
            autoFocus
          />
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs text-muted-foreground h-7 px-2"
          onClick={() => setCreating(true)}
        >
          <svg className="h-3.5 w-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建项目
        </Button>
      )}
    </div>
  );
}
