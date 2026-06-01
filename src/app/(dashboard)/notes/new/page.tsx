"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NoteEditor from "@/components/notes/NoteEditor";
import Card from "@/components/ui/Card";

export default function NewNotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const [saving, setSaving] = useState(false);

  const handleSave = async (
    title: string,
    content: string,
    commitMessage: string,
    tags: string[],
    contentHtml?: string
  ) => {
    setSaving(true);
    const body: Record<string, unknown> = { title, content, contentHtml, commitMessage, tags };
    if (projectId) body.projectId = parseInt(projectId, 10);

    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/notes/${data.note.id}`);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">新建笔记</h1>
      <Card className="p-6">
        <NoteEditor note={null} onSave={handleSave} saving={saving} />
      </Card>
    </div>
  );
}
