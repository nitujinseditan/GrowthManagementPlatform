"use client";

import { useMemo, useEffect, useState, useCallback } from "react";

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  content: string;
  previewContainerRef?: React.RefObject<HTMLDivElement | null>;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function parseHeadings(content: string): Heading[] {
  const lines = content.split("\n");
  const headings: Heading[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        id: slugify(match[2]),
      });
    }
  }
  return headings;
}

export default function TableOfContents({
  content,
  previewContainerRef,
}: TableOfContentsProps) {
  const headings = useMemo(() => parseHeadings(content), [content]);
  const [activeId, setActiveId] = useState<string>("");

  // 监听预览区标题滚动
  useEffect(() => {
    const container = previewContainerRef?.current;
    if (!container || headings.length === 0) return;

    const headingElements = headings
      .map((h) => container.querySelector(`[data-heading-id="${h.id}"]`))
      .filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-heading-id");
            if (id) setActiveId(id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    headingElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings, previewContainerRef]);

  const scrollToHeading = useCallback(
    (id: string) => {
      const container = previewContainerRef?.current;
      if (!container) return;
      const el = container.querySelector(`[data-heading-id="${id}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [previewContainerRef]
  );

  if (headings.length === 0) return null;

  return (
    <aside className="hidden xl:block w-48 shrink-0">
      <div className="sticky top-4">
        <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
          目录
        </h4>
        <nav className="space-y-0.5 max-h-[60vh] overflow-y-auto">
          {headings.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => scrollToHeading(h.id)}
              className={`block w-full text-left text-sm truncate transition-colors
                hover:text-emerald-600 py-0.5
                ${h.level === 1 ? "pl-0" : h.level === 2 ? "pl-3" : "pl-6"}
                ${
                  activeId === h.id
                    ? "text-emerald-600 font-medium"
                    : "text-stone-500"
                }`}
            >
              {h.text}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export { slugify };
