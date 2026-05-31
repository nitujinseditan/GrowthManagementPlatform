"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NoteCard from "@/components/notes/NoteCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import type { Note } from "@/types";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((data) => setNotes(data.notes || []))
      .finally(() => setLoading(false));
  }, []);

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

      {notes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-4">📝</p>
          <p className="text-lg mb-2">还没有笔记</p>
          <p className="text-sm">
            点击&ldquo;新建笔记&rdquo;开始记录你的成长轨迹
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
