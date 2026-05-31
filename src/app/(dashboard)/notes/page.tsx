"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import NoteCard from "@/components/notes/NoteCard";
import TagFilter from "@/components/notes/TagFilter";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import type { Note } from "@/types";

interface Tag {
  id: number;
  name: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 并行加载笔记和标签
    Promise.all([
      fetch("/api/notes").then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
    ])
      .then(([notesData, tagsData]) => {
        setNotes(notesData.notes || []);
        setTags(tagsData.tags || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // 客户端按标签筛选：选中标签为空则显示全部，否则要求笔记包含任一选中标签
  const filteredNotes = useMemo(() => {
    if (selectedTags.length === 0) return notes;
    return notes.filter((note) =>
      note.tags?.some((tag) => selectedTags.includes(tag.id))
    );
  }, [notes, selectedTags]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">我的笔记</h1>
        <Link href="/notes/new">
          <Button>+ 新建笔记</Button>
        </Link>
      </div>

      {/* 标签筛选栏 */}
      <TagFilter
        tags={tags}
        selected={selectedTags}
        onChange={setSelectedTags}
      />

      {filteredNotes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">📝</p>
          <p className="text-lg mb-2">
            {selectedTags.length > 0 ? "没有匹配的笔记" : "还没有笔记"}
          </p>
          <p className="text-sm">
            {selectedTags.length > 0
              ? "尝试减少筛选标签或选择「全部」"
              : "点击「新建笔记」开始记录你的成长轨迹"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
