"use client";

import { useCallback } from "react";

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

/** 工具栏按钮配置 */
interface Tool {
  label: string;
  title: string;
  before: string;
  after: string;
}

const TOOLS: Tool[] = [
  { label: "B", title: "加粗 (Ctrl+B)", before: "**", after: "**" },
  { label: "I", title: "斜体 (Ctrl+I)", before: "*", after: "*" },
  { label: "~~", title: "删除线", before: "~~", after: "~~" },
  { label: "H2", title: "二级标题", before: "## ", after: "" },
  { label: "H3", title: "三级标题", before: "### ", after: "" },
  { label: "•", title: "无序列表", before: "- ", after: "" },
  { label: "1.", title: "有序列表", before: "1. ", after: "" },
  { label: "<>", title: "行内代码", before: "`", after: "`" },
  { label: "\"", title: "引用", before: "> ", after: "" },
  { label: "🔗", title: "链接 (Ctrl+K)", before: "[", after: "](url)" },
  { label: "—", title: "分隔线", before: "\n---\n", after: "" },
];

export default function MarkdownToolbar({ textareaRef }: MarkdownToolbarProps) {
  const insertText = useCallback(
    (before: string, after: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end);
      const replacement = before + selected + after;

      // 使用 execCommand 保持 undo 栈，同时手动触发 React onChange
      // 直接设置 value 并触发 input 事件（React 合成事件兼容）
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set;
      nativeInputValueSetter?.call(
        textarea,
        textarea.value.substring(0, start) +
          replacement +
          textarea.value.substring(end)
      );
      textarea.dispatchEvent(new Event("input", { bubbles: true }));

      // 恢复光标位置（选中插入的文本或定位到 after 之后）
      const newCursorPos =
        start + before.length + (selected.length || 0) + after.length;
      textarea.setSelectionRange(
        start + before.length + selected.length + after.length,
        newCursorPos
      );
      textarea.focus();
    },
    [textareaRef]
  );

  return (
    <div className="flex items-center gap-0.5 flex-wrap p-1 border border-stone-200 rounded-lg bg-white sticky top-0 z-10">
      {TOOLS.map((tool, index) => (
        <>
          {index === 3 || index === 5 || index === 8 ? (
            <span key={`sep-${index}`} className="w-px h-5 bg-stone-200 mx-1" />
          ) : null}
          <button
            key={tool.label}
            type="button"
            title={tool.title}
            onClick={() => insertText(tool.before, tool.after)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium
                       text-stone-500 hover:bg-stone-100 hover:text-emerald-600
                       active:scale-95 transition-all duration-100"
          >
            {tool.label}
          </button>
        </>
      ))}
    </div>
  );
}
