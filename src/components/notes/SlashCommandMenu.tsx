"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { SlashCommand } from "./slashCommands";
import { filterCommands } from "./slashCommands";

interface SlashCommandMenuProps {
  /** 是否显示 */
  open: boolean;
  /** 搜索 query（用户在 / 后输入的内容） */
  query: string;
  /** 选择命令回调 */
  onSelect: (cmd: SlashCommand) => void;
  /** 关闭回调 */
  onClose: () => void;
  /** 定位锚点（textarea 元素） */
  anchorRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export default function SlashCommandMenu({
  open,
  query,
  onSelect,
  onClose,
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commands = filterCommands(query);
  const menuRef = useRef<HTMLDivElement>(null);

  // 重置选中项
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev >= commands.length - 1 ? 0 : prev + 1
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev <= 0 ? commands.length - 1 : prev - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (commands[selectedIndex]) {
            onSelect(commands[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [open, commands, selectedIndex, onSelect, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // 滚动选中项到可见区域
  useEffect(() => {
    if (menuRef.current) {
      const selected = menuRef.current.querySelector("[data-selected]");
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // 延迟添加监听，避免触发时的 click 事件立即关闭
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handler);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, onClose]);

  if (!open || commands.length === 0) return null;

  // 按 group 分组
  const groups = new Map<string, SlashCommand[]>();
  for (const cmd of commands) {
    const list = groups.get(cmd.group) || [];
    list.push(cmd);
    groups.set(cmd.group, list);
  }

  return (
    <div
      ref={menuRef}
      className="absolute z-30 mt-1 w-64 bg-white rounded-xl border border-stone-200 shadow-lg
                 p-1.5 max-h-[300px] overflow-y-auto
                 motion-safe:animate-[scaleIn_0.12s_ease-out_both]"
      style={{ top: "100%", left: 0 }}
    >
      {Array.from(groups.entries()).map(([group, cmds]) => (
        <div key={group}>
          <div className="px-2.5 py-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            {group}
          </div>
          {cmds.map((cmd) => {
            const globalIdx = commands.indexOf(cmd);
            return (
              <button
                key={cmd.id}
                type="button"
                data-selected={globalIdx === selectedIndex ? "true" : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left rounded-lg
                           transition-colors duration-75
                           ${
                             globalIdx === selectedIndex
                               ? "bg-emerald-50 text-emerald-700"
                               : "text-stone-600 hover:bg-stone-50"
                           }`}
                onClick={() => onSelect(cmd)}
                onMouseEnter={() => setSelectedIndex(globalIdx)}
              >
                <span className="w-6 text-center text-xs font-mono text-stone-400 shrink-0">
                  {cmd.icon}
                </span>
                <span className="flex-1">{cmd.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
