"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({
  content,
  className = "",
}: MarkdownPreviewProps) {
  const rendered = useMemo(
    () => (
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    ),
    [content]
  );

  if (!content.trim()) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-stone-300 text-sm select-none">
        <div className="text-center">
          <div className="text-3xl mb-2">📄</div>
          <p>预览将会出现在这里...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`prose prose-sm max-w-none overflow-y-auto ${className}`}
    >
      {rendered}
    </div>
  );
}
