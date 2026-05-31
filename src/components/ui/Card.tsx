import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({
  children,
  className = "",
  hover = false,
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-stone-200/60 shadow-sm
        ${hover ? "card-lift cursor-pointer" : ""}
        ${className}`}
    >
      {children}
    </div>
  );
}
