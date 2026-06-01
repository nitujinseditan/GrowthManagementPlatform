"use client";

import {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import type { ReactNode, KeyboardEvent } from "react";

interface DropdownContextType {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const DropdownContext = createContext<DropdownContextType>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null },
});

function useDropdown() {
  return useContext(DropdownContext);
}

// === Root ===
interface DropdownMenuProps {
  children: ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

// === Trigger ===
interface DropdownMenuTriggerProps {
  children: ReactNode;
  className?: string;
}

export function DropdownMenuTrigger({
  children,
  className = "",
}: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = useDropdown();

  return (
    <button
      ref={triggerRef}
      type="button"
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setOpen(true);
        }
      }}
      aria-haspopup="menu"
      aria-expanded={open}
    >
      {children}
    </button>
  );
}

// === Content ===
interface DropdownMenuContentProps {
  children: ReactNode;
  align?: "start" | "end";
  className?: string;
}

export function DropdownMenuContent({
  children,
  align = "start",
  className = "",
}: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef } = useDropdown();
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const contentRef = useRef<HTMLDivElement>(null);

  // 计算位置
  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      left: align === "end" ? rect.right : rect.left,
    });
  }, [align, triggerRef]);

  useEffect(() => {
    if (open) calcPosition();
  }, [open, calcPosition]);

  // 点击外部关闭 + Escape 关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const keyHandler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [open, setOpen, triggerRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={contentRef}
      role="menu"
      className={`fixed z-[80] min-w-[180px] bg-white rounded-xl border border-stone-200
                   shadow-lg p-1.5 motion-safe:animate-[fadeInUp_0.12s_ease-out_both]
                   ${align === "end" ? "origin-top-right" : "origin-top-left"}
                   ${className}`}
      style={{
        top: `${pos.top}px`,
        left: `${pos.left}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {children}
    </div>,
    document.body
  );
}

// === Item ===
interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function DropdownMenuItem({
  children,
  onClick,
  className = "",
  disabled = false,
}: DropdownMenuItemProps) {
  const { setOpen } = useDropdown();

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg
                   transition-colors duration-100
                   ${
                     disabled
                       ? "text-stone-300 cursor-not-allowed"
                       : "text-stone-700 hover:bg-stone-50 active:bg-stone-100"
                   }
                   ${className}`}
      onClick={() => {
        if (!disabled) {
          onClick?.();
          setOpen(false);
        }
      }}
    >
      {children}
    </button>
  );
}

// === Separator ===
export function DropdownMenuSeparator() {
  return <hr className="my-1 mx-2 border-stone-100" />;
}

export default DropdownMenu;
