"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import type { NoteVersion } from "@/types";

interface VersionHistoryProps {
  noteId: number;
  onCompare: (versionIdA: number, versionIdB: number) => void;
  onRevert: (versionId: number) => Promise<void>;
}

export default function VersionHistory({
  noteId,
  onCompare,
  onRevert,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [reverting, setReverting] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/notes/${noteId}/versions`)
      .then((r) => r.json())
      .then((data) => setVersions(data.versions || []))
      .finally(() => setLoading(false));
  }, [noteId]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (selectedIds.length === 2) {
      onCompare(selectedIds[0], selectedIds[1]);
    }
  };

  const handleRevert = async (versionId: number) => {
    setReverting(versionId);
    await onRevert(versionId);
    const res = await fetch(`/api/notes/${noteId}/versions`);
    const data = await res.json();
    setVersions(data.versions || []);
    setReverting(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8 text-stone-400">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-sm">暂无版本记录</p>
        <p className="text-xs text-stone-300 mt-1">
          保存笔记后，版本历史将显示在这里
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 对比操作栏 */}
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm text-stone-500 flex-1">
          {selectedIds.length === 0
            ? "选择两个版本进行对比"
            : selectedIds.length === 1
            ? "再选择一个版本"
            : "已选择两个版本"}
        </p>
        {selectedIds.length === 2 && (
          <Button size="sm" onClick={handleCompare}>
            对比选中版本
          </Button>
        )}
        {selectedIds.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds([])}
          >
            取消选择
          </Button>
        )}
      </div>

      {/* 时间轴版本列表 */}
      <div className="relative pl-6 space-y-0">
        {/* 垂直线 */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-stone-100" />

        {versions.map((v, index) => {
          const isSelected = selectedIds.includes(v.id);
          const isLatest = index === 0;
          return (
            <div key={v.id} className="relative pb-5 last:pb-0">
              {/* 圆点 */}
              <button
                onClick={() => toggleSelect(v.id)}
                className={`absolute -left-[19px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all duration-200
                  ${
                    isSelected
                      ? "bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-200"
                      : isLatest
                      ? "bg-emerald-400 border-emerald-400"
                      : "bg-white border-stone-300 hover:border-emerald-400"
                  }`}
                aria-label={`选择版本 v${v.versionNumber}`}
              />

              {/* 版本卡片 */}
              <div
                className={`rounded-xl border p-3.5 transition-all duration-200
                  ${
                    isSelected
                      ? "border-emerald-300 bg-emerald-50/50 shadow-sm"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                      v{v.versionNumber}
                      {isLatest && (
                        <span className="text-[10px] font-medium bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">
                          当前
                        </span>
                      )}
                    </p>
                    {v.commitMessage && (
                      <p className="text-xs text-stone-500 mt-0.5 truncate">
                        {v.commitMessage}
                      </p>
                    )}
                    <p className="text-xs text-stone-400 mt-1">
                      {new Date(v.createdAt).toLocaleString("zh-CN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevert(v.id)}
                    disabled={reverting === v.id}
                  >
                    {reverting === v.id ? "回退中..." : "回退"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
