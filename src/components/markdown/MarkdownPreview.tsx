"use client";

import { useMemo } from "react";
import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// 自定义 heading 组件，添加 data-heading-id 用于 TOC 滚动定位
function createHeading(level: number) {
  return function Heading({
    children,
    ...props
  }: ComponentPropsWithoutRef<"h1" | "h2" | "h3" | "h4" | "h5" | "h6">) {
    const text =
      typeof children === "string"
        ? children
        : Array.isArray(children)
          ? children
              .map((c) => (typeof c === "string" ? c : ""))
              .join("")
          : "";
    const id = slugify(text);
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    return (
      <Tag data-heading-id={id} id={id} {...props}>
        {children}
      </Tag>
    );
  };
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
};

export default function MarkdownPreview({
  content,
  className = "",
}: MarkdownPreviewProps) {
  const rendered = useMemo(
    () => (
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
        {content}
      </ReactMarkdown>
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
