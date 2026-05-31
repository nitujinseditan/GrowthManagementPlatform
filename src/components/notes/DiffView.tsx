"use client";

import { useState, useEffect } from "react";
import Spinner from "@/components/ui/Spinner";
import type { VersionDiff } from "@/types";

interface DiffViewProps {
  noteId: number;
  versionIdA: number;
  versionIdB: number;
  onClose: () => void;
}

export default function DiffView({
  noteId,
  versionIdA,
  versionIdB,
  onClose,
}: DiffViewProps) {
  const [diffData, setDiffData] = useState<VersionDiff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `/api/notes/${noteId}/versions/diff?a=${versionIdA}&b=${versionIdB}`
    )
      .then((r) => r.json())
      .then((data) => setDiffData(data.diff))
      .finally(() => setLoading(false));
  }, [noteId, versionIdA, versionIdB]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!diffData) {
    return <p className="text-red-500 text-center py-8">加载差异失败</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          对比 v{diffData.versionA.versionNumber} → v
          {diffData.versionB.versionNumber}
        </p>
        <button
          onClick={onClose}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          关闭对比
        </button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <div className="flex text-xs text-gray-500 bg-gray-50 border-b">
          <div className="flex-1 p-2 border-r">版本 A (v{diffData.versionA.versionNumber})</div>
          <div className="flex-1 p-2">版本 B (v{diffData.versionB.versionNumber})</div>
        </div>
        <div className="flex max-h-96 overflow-y-auto font-mono text-sm">
          <div className="flex-1 border-r">
            {diffData.diff.map((line, i) => {
              if (line.type === "added") return null;
              return (
                <div
                  key={i}
                  className={`px-2 py-0.5 whitespace-pre-wrap ${
                    line.type === "removed" ? "bg-red-50 text-red-700" : ""
                  }`}
                >
                  {line.value}
                </div>
              );
            })}
          </div>
          <div className="flex-1">
            {diffData.diff.map((line, i) => {
              if (line.type === "removed") return null;
              return (
                <div
                  key={i}
                  className={`px-2 py-0.5 whitespace-pre-wrap ${
                    line.type === "added" ? "bg-green-50 text-green-700" : ""
                  }`}
                >
                  {line.value}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
