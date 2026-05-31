interface BadgeProps {
  children: string;
  variant?: "default" | "primary" | "emerald";
  removable?: boolean;
  onRemove?: () => void;
}

export default function Badge({
  children,
  variant = "default",
  removable = false,
  onRemove,
}: BadgeProps) {
  const variants = {
    default: "bg-stone-100 text-stone-600",
    primary: "bg-emerald-50 text-emerald-700",
    emerald: "bg-emerald-500 text-white",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-150 ${variants[variant]}`}
    >
      {children}
      {removable && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label={`移除标签 ${children}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
