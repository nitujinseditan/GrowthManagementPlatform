import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  /** 标签文字（可选，传入时渲染在输入框上方） */
  label?: string
  /** 错误信息（可选，传入时显示红色提示） */
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label}` : undefined)
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-emerald-400 focus-visible:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-[border-color,box-shadow] duration-200",
            error && "border-destructive focus-visible:border-destructive focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
export default Input
