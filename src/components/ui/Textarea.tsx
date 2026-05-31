import { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({
  label,
  error,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm transition-all duration-200
          placeholder:text-stone-400
          focus:outline-none focus:border-emerald-400
          focus:shadow-[0_0_0_3px_rgba(16,185,129,0.12)]
          resize-vertical
          ${error ? "border-red-400" : "border-stone-200 hover:border-stone-300"}
          ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
