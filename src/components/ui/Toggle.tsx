"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  pressed: boolean;
  onPressedChange?: (pressed: boolean) => void;
  children: ReactNode;
  size?: "sm" | "md";
}

export default function Toggle({
  pressed,
  onPressedChange,
  children,
  size = "sm",
  className = "",
  ...props
}: ToggleProps) {
  const baseSize = size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm";

  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={`inline-flex items-center justify-center rounded-lg font-medium
                   transition-all duration-150 select-none
                   ${
                     pressed
                       ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                       : "text-stone-500 hover:bg-stone-100 hover:text-stone-700 active:bg-stone-200"
                   }
                   ${baseSize} ${className}`}
      onClick={() => onPressedChange?.(!pressed)}
      {...props}
    >
      {children}
    </button>
  );
}
