import {
  StarterKit,
  Placeholder,
  TiptapLink,
  TiptapImage,
  UpdatedImage,
  TaskList,
  TaskItem,
  TiptapUnderline,
  TextStyle,
  Color,
  HighlightExtension,
  CustomKeymap,
  GlobalDragHandle,
  UploadImagesPlugin,
} from "novel";

import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

export const defaultExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    codeBlock: {
      lowlight,
    },
  }),
  Placeholder,
  TiptapLink.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-emerald-600 underline underline-offset-2 hover:text-emerald-700 cursor-pointer",
    },
  }),
  UpdatedImage.configure({
    HTMLAttributes: {
      class: "rounded-lg border border-border",
    },
  }),
  TiptapImage.configure({
    allowBase64: true,
    HTMLAttributes: {
      class: "rounded-lg border border-border",
    },
  }),
  TaskList.configure({
    HTMLAttributes: {
      class: "not-prose pl-2",
    },
  }),
  TaskItem.configure({
    HTMLAttributes: {
      class: "flex items-start my-1",
    },
    nested: true,
  }),
  TiptapUnderline,
  TextStyle,
  Color,
  HighlightExtension.configure({
    multicolor: true,
  }),
  CustomKeymap,
  GlobalDragHandle,
  UploadImagesPlugin({ imageClass: "opacity-40" }),
];
