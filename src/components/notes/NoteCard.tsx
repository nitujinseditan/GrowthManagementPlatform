import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Note } from "@/types";

export default function NoteCard({ note }: { note: Note }) {
  const versionCount = note.currentVersion ? 1 : 0;

  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="p-5 h-full flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        {/* 顶部：标题 + 标记 */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-stone-900 leading-snug line-clamp-2 flex items-center gap-1.5">
              {note.icon && <span className="shrink-0 text-base">{note.icon}</span>}
              {note.isPinned && <span className="shrink-0 text-xs">📌</span>}
              <span className="truncate">{note.title || "无标题"}</span>
            </h3>
            {note.description && (
              <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">{note.description}</p>
            )}
          </div>
          {note.isPublic && (
            <span className="shrink-0 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-200/40">
              公开
            </span>
          )}
        </div>

        {/* 中间留白推到底部 */}
        <div className="flex-1" />

        {/* 标签行 */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id}>{tag.name}</Badge>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs text-stone-400">+{note.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-100">
          <span>{new Date(note.updatedAt).toLocaleDateString("zh-CN", {
            month: "short",
            day: "numeric",
          })}</span>
          <div className="flex items-center gap-2">
            {versionCount > 0 && (
              <span className="text-emerald-500 font-medium">
                v{note.currentVersion?.versionNumber}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
