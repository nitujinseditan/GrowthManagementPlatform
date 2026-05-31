"use client";

interface TagFilterProps {
  tags: { id: number; name: string }[];
  selected: number[];
  onChange: (selectedIds: number[]) => void;
}

export default function TagFilter({ tags, selected, onChange }: TagFilterProps) {
  if (tags.length === 0) return null;

  const toggleTag = (tagId: number) => {
    if (selected.includes(tagId)) {
      onChange(selected.filter((id) => id !== tagId));
    } else {
      onChange([...selected, tagId]);
    }
  };

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
      {/* 全部 */}
      <button
        onClick={() => onChange([])}
        className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200
          ${
            selected.length === 0
              ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200/50"
              : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
          }`}
      >
        全部
      </button>

      {tags.map((tag) => {
        const isSelected = selected.includes(tag.id);
        return (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              ${
                isSelected
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200/50"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
              }`}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
