import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Note } from "@/types";

export default function NoteCard({ note }: { note: Note }) {
  const versionCount = note.currentVersion ? 1 : 0;

  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-medium text-gray-900 truncate flex-1">
            {note.title}
          </h3>
          {note.isPublic && <Badge variant="primary">公开</Badge>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {note.tags?.map((tag) => (
            <Badge key={tag.id}>{tag.name}</Badge>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span>
            {new Date(note.updatedAt).toLocaleDateString("zh-CN")}
          </span>
          {versionCount > 0 && <span>v{note.currentVersion?.versionNumber}</span>}
        </div>
      </Card>
    </Link>
  );
}
