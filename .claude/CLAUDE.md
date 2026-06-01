# 项目 UI 设计规范（自动遵循）

你生成任何前端界面代码（React/Next.js 组件、页面、样式）时，必须遵守以下设计原则：

## 组件库优先级
1. 优先使用 **shadcn/ui** 组件（`src/components/ui/`）→ 已安装 Button, Card, Input, Textarea, Dialog, DropdownMenu, Tabs, Toast, Tooltip, Separator, Badge, Skeleton
2. 自定义组件使用 `cn()` 工具函数合并类名（来自 `@/lib/utils`，基于 clsx + tailwind-merge）
3. Button/Card/Badge 的旧版 API（default export）兼容仍可用，新代码应使用 shadcn compound/variant API

## 设计令牌（CSS 变量 + Tailwind 语义类）
- 使用语义类名：`bg-primary` / `text-muted-foreground` / `border-input` / `bg-accent` 等
- 可用原生 Tailwind 色板（stone-*, emerald-*, red-*）作为补充，不强制替换
- 圆角使用：`rounded-md`（按钮/输入框）、`rounded-lg`（卡片）、`rounded-full`（标签）
- 阴影使用：`shadow-sm` / `shadow-md` / `shadow-lg`

## 视觉规范
1. **极简暖灰**：背景 stone-50/white，主按钮 emerald primary，文字 stone 色系
2. **柔光聚焦**：输入框使用 shadcn 标准 `focus-visible:ring-2 focus-visible:ring-ring`，卡片悬浮 `hover:shadow-lg hover:-translate-y-1`
3. **高可读性**：system-ui, -apple-system, Inter；编辑器 font-mono；行距 1.5，字号 ≥14px
4. **间距系统**：8px 基数（4,8,16,24,32），卡片内边距 ≥16px
5. **动画**：使用 tailwind.config.ts 中注册的 animate-* 工具类，stagger 延迟入场，prefers-reduced-motion 支持
6. **留白**：区块间 ≥24px
7. **移动端**：触摸目标 ≥44px，底部 Tab 栏 safe-area-bottom，侧边栏→抽屉

## 文件结构
- shadcn 组件：`src/components/ui/[name].tsx`（自动生成，使用 design tokens）
- 自定义组件：`src/components/[domain]/[Name].tsx`
- 工具函数：`src/lib/utils.ts`（cn）, `src/lib/export.ts`, `src/lib/uploadImage.ts`

你必须在生成每一段 UI 代码之前，主动在脑海中检查上述规则。如果现有代码不符合，优先修改使其符合。完成后不需要额外报告，直接输出最终代码即可。

注意：因为我已经开启了 auto-approve，你可以直接创建和修改文件，无需询问。
