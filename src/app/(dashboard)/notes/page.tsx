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

  const filteredNotes = useMemo(() => {
    if (selectedTags.length === 0) return notes;
    return notes.filter((note) =>
      note.tags?.some((tag) => selectedTags.includes(tag.id))
    );
  }, [notes, selectedTags]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 顶部：标题 + 操作 */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">我的笔记</h1>
          <p className="text-sm text-stone-400 mt-1">
            {notes.length} 篇笔记 · {tags.length} 个标签
          </p>
        </div>
        <Link href="/notes/new">
          <Button>+ 新建笔记</Button>
        </Link>
      </div>

      {/* 标签筛选 */}
      <TagFilter
        tags={tags}
        selected={selectedTags}
        onChange={setSelectedTags}
      />

      {/* 笔记列表 */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <div className="text-5xl mb-4">
            {selectedTags.length > 0 ? "🔍" : "📝"}
          </div>
          <p className="text-lg font-medium text-stone-500 mb-2">
            {selectedTags.length > 0 ? "没有匹配的笔记" : "还没有笔记"}
          </p>
          <p className="text-sm">
            {selectedTags.length > 0
              ? "尝试减少筛选标签或选择「全部」"
              : "点击右上角「新建笔记」开始记录你的成长轨迹"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note, index) => (
            <div
              key={note.id}
              className={`animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}
            >
              <NoteCard note={note} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
