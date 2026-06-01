"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import type { ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const iconMap: Record<ToastType, string> = {
  success: "✅",
  error: "⚠️",
  info: "ℹ️",
};

const colorMap: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50",
  error: "border-red-200 bg-red-50",
  info: "border-stone-200 bg-white",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    // 3 秒后自动移除
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const toast = useCallback(
    (message: string, type?: ToastType) => addToast(message, type),
    [addToast]
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast 容器：右下角固定定位 */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm"
          aria-live="polite"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg
                          motion-safe:animate-[toastIn_0.3s_ease-out_both]
                          ${colorMap[t.type]}`}
            >
              <span className="text-sm shrink-0">{iconMap[t.type]}</span>
              <p className="text-sm text-stone-700 flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="text-stone-300 hover:text-stone-500 shrink-0 transition-colors"
                aria-label="关闭"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
