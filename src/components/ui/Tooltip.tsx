"use client";

import { useState, useRef, useCallback, cloneElement, isValidElement } from "react";
import { createPortal } from "react-dom";
import type { ReactElement, MouseEvent } from "react";

interface TooltipProps {
  content: string;
  children: ReactElement;
  delay?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChildProps = Record<string, any>;

export default function Tooltip({ content, children, delay = 400 }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorRef = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      if (anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 6,
          left: rect.left + rect.width / 2,
        });
        setVisible(true);
      }
    }, delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  const child = isValidElement(children) ? children : null;
  if (!child) return null;

  const childProps = child.props as ChildProps;

  const trigger = cloneElement(child, {
    onMouseEnter: (e: MouseEvent) => {
      show();
      childProps.onMouseEnter?.(e);
    },
    onMouseLeave: (e: MouseEvent) => {
      hide();
      childProps.onMouseLeave?.(e);
    },
    ref: (node: HTMLElement | null) => {
      anchorRef.current = node;
      const origRef = (child as ChildProps).ref;
      if (typeof origRef === "function") origRef(node);
      else if (origRef && "current" in origRef) origRef.current = node;
    },
  });

  return (
    <>
      {trigger}
      {visible &&
        createPortal(
          <div
            className="fixed z-[100] px-2.5 py-1.5 bg-stone-800 text-white text-xs rounded-lg shadow-lg
                       pointer-events-none max-w-[200px] text-center leading-relaxed
                       motion-safe:animate-[fadeInUp_0.15s_ease-out_both]"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform: "translateX(-50%)",
            }}
            role="tooltip"
          >
            {content}
            <div
              className="absolute left-1/2 -translate-x-1/2 -top-1.5
                         w-0 h-0 border-l-[5px] border-r-[5px] border-b-[6px]
                         border-l-transparent border-r-transparent border-b-stone-800"
            />
          </div>,
          document.body
        )}
    </>
  );
}
