import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-[0.97] select-none";
  const sizes =
    size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm";
  const variants = {
    primary:
      "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-200/50 hover:shadow-md hover:shadow-emerald-300/40",
    secondary:
      "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 hover:border-stone-300 shadow-sm",
    danger:
      "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-200/50",
    ghost:
      "text-stone-600 hover:text-stone-900 hover:bg-stone-100",
  };

  return (
    <button
      className={`${base} ${sizes} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
