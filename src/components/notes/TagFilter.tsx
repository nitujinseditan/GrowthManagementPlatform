"use client";

interface TagFilterProps {
  tags: { id: number; name: string }[];
  selected: number[];
  onChange: (selectedIds: number[]) => void;
}

export default function TagFilter({ tags, selected, onChange }: TagFilterProps) {
  // 没有标签时不渲染
  if (tags.length === 0) return null;

  const toggleTag = (tagId: number) => {
    if (selected.includes(tagId)) {
      onChange(selected.filter((id) => id !== tagId));
    } else {
      onChange([...selected, tagId]);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6">
      {/* 全部标签：选中时清空筛选 */}
      <button
        onClick={() => onChange([])}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
          ${
            selected.length === 0
              ? "bg-emerald-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${
                isSelected
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
