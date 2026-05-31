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
    // 重新加载版本列表
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
    return <p className="text-gray-400 text-center py-8">暂无版本记录</p>;
  }

  return (
    <div className="space-y-3">
      {selectedIds.length === 2 && (
        <Button size="sm" onClick={handleCompare}>
          对比选中版本
        </Button>
      )}
      <div className="space-y-2">
        {versions.map((v) => (
          <div
            key={v.id}
            className={`border rounded-lg p-3 flex items-center justify-between ${
              selectedIds.includes(v.id) ? "border-blue-400 bg-blue-50" : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <input
                type="checkbox"
                checked={selectedIds.includes(v.id)}
                onChange={() => toggleSelect(v.id)}
                className="rounded"
              />
              <div>
                <p className="text-sm font-medium">
                  v{v.versionNumber}
                  {v.commitMessage && (
                    <span className="text-gray-500 ml-2 font-normal">
                      — {v.commitMessage}
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(v.createdAt).toLocaleString("zh-CN")}
                </p>
              </div>
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
        ))}
      </div>
    </div>
  );
}
