import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent text-accent-foreground hover:bg-accent/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// ═══════════════════════════════════════════
// 向后兼容：旧版 Badge API (variant="primary"|"secondary"|"danger", removable, onRemove)
// Phase 4 重写 NoteEditor 后删除
// ═══════════════════════════════════════════

type LegacyVariant = "primary" | "secondary" | "danger";

interface LegacyBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: LegacyVariant;
  removable?: boolean;
  onRemove?: () => void;
}

function LegacyBadge({
  variant = "primary",
  removable,
  onRemove,
  className,
  children,
  ...props
}: LegacyBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "primary" &&
          "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
        variant === "secondary" &&
          "bg-stone-100 text-stone-600 border border-stone-200/60",
        variant === "danger" &&
          "bg-red-50 text-red-600 border border-red-200/60",
        className
      )}
      {...props}
    >
      {children}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 transition-colors"
          aria-label="移除"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
LegacyBadge.displayName = "LegacyBadge";

export default LegacyBadge;
export { Badge, badgeVariants }
