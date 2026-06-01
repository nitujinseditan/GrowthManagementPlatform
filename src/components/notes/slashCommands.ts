export interface SlashCommand {
  /** 命令标识 */
  id: string;
  /** 显示标签 */
  label: string;
  /** 图标 emoji */
  icon: string;
  /** 搜索关键词（空格分隔） */
  keywords: string;
  /** 插入模板：before 为光标前文本，after 为光标后文本，cursorOffset 为插入后光标相对 before 结束的偏移 */
  before: string;
  after: string;
  /** 分组 */
  group: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  // 标题
  { id: "h1", label: "标题 1", icon: "H1", keywords: "标题 一级 h1 heading1", before: "# ", after: "", group: "标题" },
  { id: "h2", label: "标题 2", icon: "H2", keywords: "标题 二级 h2 heading2", before: "## ", after: "", group: "标题" },
  { id: "h3", label: "标题 3", icon: "H3", keywords: "标题 三级 h3 heading3", before: "### ", after: "", group: "标题" },

  // 文本格式
  { id: "bold", label: "粗体", icon: "B", keywords: "加粗 bold 粗体", before: "**", after: "**", group: "格式" },
  { id: "italic", label: "斜体", icon: "I", keywords: "斜体 italic 倾斜", before: "*", after: "*", group: "格式" },
  { id: "strikethrough", label: "删除线", icon: "S", keywords: "删除线 strikethrough 划线", before: "~~", after: "~~", group: "格式" },
  { id: "code", label: "行内代码", icon: "<>", keywords: "代码 inline code 内联", before: "`", after: "`", group: "格式" },

  // 列表
  { id: "ul", label: "无序列表", icon: "•", keywords: "列表 ul unordered bullet 无序", before: "- ", after: "", group: "列表" },
  { id: "ol", label: "有序列表", icon: "1.", keywords: "有序列表 ol ordered number 编号", before: "1. ", after: "", group: "列表" },
  { id: "task", label: "任务列表", icon: "☑", keywords: "任务 task todo checkbox 勾选", before: "- [ ] ", after: "", group: "列表" },

  // 块级元素
  { id: "quote", label: "引用", icon: "❝", keywords: "引用 quote blockquote 引述", before: "> ", after: "", group: "块" },
  { id: "codeblock", label: "代码块", icon: "{ }", keywords: "代码块 codeblock fenced 代码", before: "```\n", after: "\n```", group: "块" },
  { id: "table", label: "表格", icon: "⊞", keywords: "表格 table 行列", before: "| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n", after: "", group: "块" },
  { id: "hr", label: "分割线", icon: "—", keywords: "分割线 hr divider 横线", before: "\n---\n", after: "", group: "块" },

  // 媒体
  { id: "image", label: "图片", icon: "🖼", keywords: "图片 image img 插图", before: "![", after: "](https://)", group: "媒体" },
  { id: "link", label: "链接", icon: "🔗", keywords: "链接 link url 超链接", before: "[", after: "](url)", group: "媒体" },
];

/** 按搜索词过滤命令（匹配 label + keywords） */
export function filterCommands(query: string): SlashCommand[] {
  const q = query.toLowerCase().trim();
  if (!q) return SLASH_COMMANDS;

  return SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.keywords.toLowerCase().includes(q)
  );
}
