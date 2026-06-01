"use client";

import { useCallback, useRef } from "react";
import {
  EditorRoot,
  EditorContent,
  createImageUpload,
  handleImagePaste,
  handleImageDrop,
  Placeholder,
} from "novel";
import { defaultExtensions } from "./novelExtensions";

interface NovelEditorProps {
  /** 初始 HTML 内容 */
  initialContent?: string;
  /** 内容变化回调，返回 HTML */
  onUpdate?: (html: string) => void;
  /** 编辑器是否可编辑 */
  editable?: boolean;
  /** 占位文字 */
  placeholder?: string;
}

// 图片上传到 /api/upload
const uploadFn = createImageUpload({
  onUpload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("上传失败");
    const data = await res.json();
    return data.url;
  },
});

export default function NovelEditor({
  initialContent,
  onUpdate,
  editable = true,
  placeholder = "开始写作... 输入 / 唤出命令菜单",
}: NovelEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  const handleUpdate = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ editor }: { editor: any }) => {
      const html = editor.getHTML();
      onUpdate?.(html);
    },
    [onUpdate]
  );

  const handleCreate = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ editor }: { editor: any }) => {
      editorRef.current = editor;
      if (initialContent && initialContent.trim() !== "") {
        editor.commands.setContent(initialContent);
      }
    },
    [initialContent]
  );

  const extensions = [
    ...defaultExtensions,
    Placeholder.configure({ placeholder }),
  ];

  return (
    <div className="novel-editor w-full min-h-[300px]">
      <EditorRoot>
        <EditorContent
          extensions={extensions}
          editable={editable}
          onUpdate={handleUpdate}
          onCreate={handleCreate}
          editorProps={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            handlePaste: (view: any, event: ClipboardEvent) =>
              handleImagePaste(view, event, uploadFn),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            handleDrop: (view: any, event: DragEvent, moved: boolean) =>
              handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-stone dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
        />
      </EditorRoot>
    </div>
  );
}
