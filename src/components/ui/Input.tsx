import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export default function Input({
  label,
  error,
  hint,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          {label}
        </label>
      )}
      {hint && (
        <p className="text-xs text-stone-400 mb-1">{hint}</p>
      )}
      <input
        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm transition-all duration-200
          placeholder:text-stone-400
          focus:outline-none focus:border-emerald-400
          focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]
          ${error ? "border-red-400 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" : "border-stone-200 hover:border-stone-300"}
          ${className}`}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${props.id || props.name}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${props.id || props.name}-error`}
          className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
          role="alert"
        >
          <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
