# DESIGN_PLAN.md — 前端设计规范 v3

> **2026-06-01 全面重写**：以 Notion 级别专业质感为目标，统一设计语言。
> 本文档是所有前端开发的风格基准，任何 UI 代码必须遵守。

---

## 一、设计哲学

### 1.1 核心原则

| 原则 | 说明 |
|------|------|
| **克制** | 每个页面只做一件事，信息密度适中，留白充足 |
| **一致** | 相同功能用相同组件，相同状态用相同样式 |
| **可预期** | 用户看到一个元素就知道它能交互、交互后会怎样 |
| **安静** | 颜色不喧哗、动画不炫技、文字不堆砌 |

### 1.2 情感目标

用户打开产品后的感觉：**安静地做事**。
不是「哇好酷」，而是「嗯，顺手」。

### 1.3 参考标杆

- **Notion** — 信息层级、留白节奏、交互反馈
- **Linear** — 色彩克制、动画精准、暗色模式
- **Arc Browser** — 侧边栏导航、项目树结构

---

## 二、色彩系统

### 2.1 令牌定义（CSS 变量 + HSL）

所有颜色通过 `hsl(var(--xxx))` 引用，**禁止硬编码色值**。

```css
:root {
  /* 中性色 — stone 暖灰系 */
  --background:        60 9% 98%;    /* stone-50  #fafaf9 */
  --foreground:        24 10% 10%;   /* stone-900 #1c1917 */
  --card:              0 0% 100%;    /* white */
  --card-foreground:   24 10% 10%;
  --popover:           0 0% 100%;
  --popover-foreground:24 10% 10%;
  --muted:             60 5% 96%;    /* stone-100 */
  --muted-foreground:  30 6% 45%;    /* stone-500 */
  --secondary:         60 5% 96%;
  --secondary-foreground: 24 10% 10%;

  /* 主色 — emerald */
  --primary:           160 84% 39%;  /* emerald-500 #10b981 */
  --primary-foreground:0 0% 100%;

  /* 强调色 */
  --accent:            152 81% 90%;  /* emerald-100 */
  --accent-foreground: 163 88% 20%;  /* emerald-800 */

  /* 功能色 */
  --destructive:       0 84% 60%;    /* red-500 */
  --destructive-foreground: 0 0% 100%;

  /* 结构色 */
  --border:            20 6% 90%;    /* stone-200 */
  --input:             20 6% 90%;
  --ring:              160 84% 39%;  /* emerald-500 */
}
```

### 2.2 色彩使用规则

| 场景 | 用色 | 示例 |
|------|------|------|
| 页面背景 | `bg-background` | stone-50 |
| 卡片背景 | `bg-card` | white |
| 主文字 | `text-foreground` | stone-900 |
| 辅助文字 | `text-muted-foreground` | stone-500 |
| 边框 | `border-border` | stone-200 |
| 主按钮 | `bg-primary text-primary-foreground` | emerald-500 |
| 次按钮 | `bg-secondary text-secondary-foreground` | stone-100 |
| 危险操作 | `bg-destructive text-destructive-foreground` | red-500 |
| 标签/徽章 | `bg-accent text-accent-foreground` | emerald-100 底 + emerald-800 字 |
| 链接 | `text-primary hover:text-primary/80` | emerald |
| 焦点环 | `ring-ring` | emerald-500 |

### 2.3 暗色模式（预留，暂不实现）

暗色模式通过 `class` 策略切换（`darkMode: ["class"]`），CSS 变量在 `.dark` 类下覆盖。当前阶段不实现暗色模式，但所有颜色必须走令牌，为后续切换做准备。

---

## 三、排版系统

### 3.1 字体栈

```css
font-family: system-ui, -apple-system, "Inter", "Segoe UI", sans-serif;
```

- **正文**：14px / 1.6 行高
- **标题**：继承 Tailwind 的 `text-lg` / `text-xl` / `text-2xl` 等
- **代码**：`font-mono`，13px
- **辅助文字**：12px

### 3.2 字号层级

| 用途 | Tailwind 类 | 字号 | 字重 |
|------|------------|------|------|
| 页面标题 | `text-2xl font-bold` | 24px | 700 |
| 区块标题 | `text-lg font-semibold` | 18px | 600 |
| 卡片标题 | `text-base font-medium` | 16px | 500 |
| 正文 | `text-sm` | 14px | 400 |
| 辅助文字 | `text-xs text-muted-foreground` | 12px | 400 |

---

## 四、间距与圆角

### 4.1 间距

基于 **4px 网格**，所有间距为 4 的倍数：

| 场景 | 值 | Tailwind |
|------|-----|---------|
| 紧凑元素内边距 | 4px | `p-1` |
| 输入框/按钮内边距 | 8px 12px | `px-3 py-2` |
| 卡片内边距 | 16px | `p-4` |
| 区块间距 | 24px | `space-y-6` / `gap-6` |
| 页面内边距 | 24px (mobile) / 32px (desktop) | `p-4 md:p-6` |

### 4.2 圆角

| 元素 | 圆角 | Tailwind |
|------|------|---------|
| 按钮/输入框/标签 | 6px | `rounded-md` |
| 卡片/对话框 | 12px | `rounded-xl` |
| 头像/圆形按钮 | 50% | `rounded-full` |

---

## 五、阴影系统

三层阴影模拟真实纸张叠放：

| 级别 | 值 | 用途 |
|------|-----|------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` | 输入框、标签 |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.06)` | 卡片默认、按钮 |
| `shadow-lg` | `0 12px 32px rgba(0,0,0,0.08)` | 卡片 hover、对话框 |
| `shadow-xl` | `0 20px 48px rgba(0,0,0,0.10)` | 弹窗、浮层 |

**使用规则：**
- 默认状态用 `shadow-sm` 或无阴影
- hover 状态提升一级阴影
- 模态/浮层用 `shadow-lg` 或 `shadow-xl`
- **禁止彩色阴影**（如 `shadow-emerald-500/20`），仅主按钮例外

---

## 六、动画系统

### 6.1 原则

- **有目的**：每个动画都服务于「让用户理解发生了什么」
- **快速**：150-300ms，不浪费用户时间
- **可关闭**：尊重 `prefers-reduced-motion`

### 6.2 标准动画

| 场景 | 动画 | 时长 | 缓动 |
|------|------|------|------|
| 页面入场 | `fadeInUp`（opacity 0→1, Y 12→0） | 400ms | `ease-out` |
| 卡片 hover | `translateY(-2px)` + 阴影提升 | 200ms | `ease-out` |
| 按钮 active | `scale(0.97)` | 100ms | `ease-in-out` |
| 输入框聚焦 | border 颜色过渡 + box-shadow 扩散 | 200ms | `ease` |
| 对话框入场 | `scale(0.95)→1` + opacity | 200ms | `ease-out` |
| Toast 入场 | `translateX(100%)→0` | 300ms | `ease-out` |
| 标签选中 | 背景色渐变 | 200ms | `ease` |

### 6.3 交错入场

列表项使用 stagger 延迟入场（每项 +50ms），最多 8 项：
```css
.stagger-1 { animation-delay: 0ms; }
.stagger-2 { animation-delay: 50ms; }
/* ... */
.stagger-8 { animation-delay: 350ms; }
```

---

## 七、组件规范

### 7.1 组件库

使用 **shadcn/ui**（Radix UI + Tailwind + cva），所有组件位于 `src/components/ui/`。

**禁止自建与 shadcn 同名的组件**。需要扩展时，在 shadcn 组件基础上添加 variant 或 className。

### 7.2 组件状态色

| 组件 | 默认 | hover | active | focus | disabled |
|------|------|-------|--------|-------|----------|
| Primary Button | emerald gradient | 深一级 | scale(0.97) | ring-2 ring-ring | opacity-50 |
| Secondary Button | stone-100 | stone-200 | scale(0.97) | ring-2 ring-ring | opacity-50 |
| Ghost Button | transparent | stone-100 | stone-200 | ring-2 ring-ring | opacity-50 |
| Input | border-stone-200 | border-stone-300 | — | border-emerald-400 + glow | opacity-50 |
| Card | white + shadow-sm | translateY(-2px) + shadow-md | — | — | — |
| Badge | emerald-50 底 | emerald-100 | — | — | — |

### 7.3 Button 变体

```tsx
// 主按钮 — emerald 渐变，用于页面主操作（保存、提交、新建）
<Button>保存</Button>

// 次按钮 — stone 底色，用于次要操作（取消、返回）
<Button variant="secondary">取消</Button>

// 幽灵按钮 — 透明底，用于工具栏、侧边栏导航
<Button variant="ghost">编辑</Button>

// 危险按钮 — 红色，用于删除等不可逆操作
<Button variant="destructive">删除</Button>

// 链接按钮 — 文字样式，用于页内跳转
<Button variant="link">查看详情</Button>
```

### 7.4 Card 使用

```tsx
// 标准卡片
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>内容</CardContent>
</Card>

// 可悬浮卡片（列表项）
<Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
  ...
</Card>
```

### 7.5 输入框聚焦效果

所有输入框/文本域使用柔光晕聚焦，**禁止**使用默认的 ring-2 效果：

```tsx
className="focus-visible:outline-none focus-visible:border-emerald-400 focus-visible:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] transition-[border-color,box-shadow] duration-200"
```

---

## 八、布局系统

### 8.1 响应式断点

| 断点 | 宽度 | 场景 |
|------|------|------|
| 默认 (mobile) | < 768px | 单列，底部 Tab 栏，侧边栏→抽屉 |
| md | ≥ 768px | 侧边栏常驻，双栏编辑器 |
| xl | ≥ 1280px | 显示目录面板 |

### 8.2 页面结构

```
┌──────────────────────────────────────────┐
│ [移动端顶栏]                              │
├──────────┬───────────────────────────────┤
│          │                               │
│ Sidebar  │       Main Content            │
│ (w-56)   │       (flex-1)                │
│          │                               │
│ ┌──────┐ │  ┌─────────────────────────┐  │
│ │ 品牌  │ │  │  页面标题 + 操作按钮    │  │
│ ├──────┤ │  ├─────────────────────────┤  │
│ │ 项目树│ │  │                         │  │
│ │ 笔记  │ │  │     页面内容            │  │
│ │ 社区  │ │  │                         │  │
│ ├──────┤ │  └─────────────────────────┘  │
│ │ 用户  │ │                               │
│ └──────┘ │                               │
├──────────┴───────────────────────────────┤
│ [移动端底部 Tab 栏]                       │
└──────────────────────────────────────────┘
```

### 8.3 侧边栏

- 宽度：`w-56`（224px）
- 背景：`bg-stone-50`（比主内容区深一级）
- 激活指示条：左侧 3px emerald 色条
- 品牌区：emoji icon + 产品名
- 导航项：ghost button 样式
- 用户区：头像 + 名称 + 退出
- 移动端：从左侧滑入的抽屉

### 8.4 移动端底部 Tab 栏

- 固定底部 `fixed bottom-0`
- 背景：`bg-white/90 backdrop-blur`
- 安全区：`pb-[env(safe-area-inset-bottom)]`
- Tab 项：图标 + 文字，激活态 emerald 色

---

## 九、编辑器规范

### 9.1 Novel 编辑器（Notion 风格）

- 基于 Tiptap 的 Novel 编辑器
- 支持斜杠命令（`/` 触发菜单）
- 支持拖拽图片上传
- 支持快捷键：Cmd+B 粗体、Cmd+I 斜体、Cmd+K 链接
- 内容存储：HTML（Novel 输出）+ Markdown（兼容旧版本）
- 预览：编辑即所见，无需独立预览面板

### 9.2 编辑器布局

```
┌─────────────────────────────────────────┐
│ ← 返回  │  📤 发布  │  🗑️ 删除          │
├─────────┴─────────┴────────────────────┤
│ ✏️ 编辑  │  📋 版本历史  │  🤖 AI 教练  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────┐  ┌──────────┐ │
│  │                     │  │  目录     │ │
│  │   Novel Editor      │  │  · 标题1  │ │
│  │   (flex-1)          │  │  · 标题2  │ │
│  │                     │  │  · 标题3  │ │
│  │                     │  │          │ │
│  └─────────────────────┘  └──────────┘ │
│                                         │
│  标签: [tag1] [tag2] [+添加]            │
│  提交说明: [输入框]  [💾 保存]           │
└─────────────────────────────────────────┘
```

---

## 十、项目树规范

### 10.1 数据模型

```
Project (自引用树)
├── id, userId, name, parentId, icon, sortOrder
└── 支持无限层级嵌套

Note.projectId → Project.id (ON DELETE SET NULL)
```

### 10.2 交互规范

- **展开/折叠**：点击箭头图标，动画旋转 90°
- **选中项目**：高亮背景色，筛选该项目下笔记
- **新建项目**：右键菜单或底部「+ 新建项目」按钮
- **重命名**：双击名称进入内联编辑模式
- **删除**：右键菜单 → 确认对话框 → 级联删除子项目
- **移动**：拖拽到目标项目（Phase 7 实现）

### 10.3 侧边栏集成

```
┌──────────────────────┐
│ 🧠 成长第二大脑       │
├──────────────────────┤
│                      │
│ 📝 我的笔记           │
│                      │
│ 📁 项目               │
│   ▼ 📚 学习笔记       │
│     📖 英语           │
│     📖 编程           │
│   ▶ 🏢 工作           │
│   ▶ 🎯 目标           │
│   + 新建项目          │
│                      │
│ 🌐 社区               │
│                      │
├──────────────────────┤
│ 👤 用户名             │
│    退出登录           │
└──────────────────────┘
```

---

## 十一、无障碍规范

- 所有交互元素可通过 Tab 聚焦
- 焦点状态可见：`ring-2 ring-ring ring-offset-2`
- 按钮/图标按钮有 `aria-label`
- 颜色对比度 ≥ 4.5:1（WCAG AA）
- 动画支持 `prefers-reduced-motion`
- 表单输入框有 `label` 或 `aria-label`

---

## 十二、移动端规范

- 触摸目标最小 44px × 44px
- 底部 Tab 栏高度 56px + safe-area
- 侧边栏：抽屉式，从左侧滑入，带遮罩
- 编辑器：全宽，隐藏目录面板
- 卡片列表：单列布局
- 输入框：字体 ≥ 16px（防止 iOS 自动缩放）

---

## 十三、文件结构

```
src/
├── components/
│   ├── ui/              # shadcn/ui 组件（自动生成 + 手动扩展）
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── scroll-area.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── toggle.tsx
│   │   ├── tooltip.tsx
│   │   ├── toast.tsx + toaster.tsx
│   │   ├── Spinner.tsx     # 自定义，非 shadcn
│   │   └── QuickSwitcher.tsx  # 自定义，非 shadcn
│   ├── layout/          # 布局组件
│   ├── notes/           # 笔记相关
│   ├── projects/        # 项目树相关（新增）
│   ├── community/       # 社区相关
│   ├── ai/              # AI 对话
│   └── markdown/        # Markdown 渲染（保留给版本历史 diff）
```

---

## 十四、实施检查清单

每次修改 UI 代码前，必须检查：

- [ ] 颜色是否使用 `hsl(var(--xxx))` 或 Tailwind 语义类？
- [ ] 间距是否为 4px 的倍数？
- [ ] 圆角是否使用 `rounded-md` / `rounded-xl` / `rounded-full`？
- [ ] 阴影是否使用 `shadow-sm` / `shadow-md` / `shadow-lg`？
- [ ] 交互元素是否有 hover / focus / active 状态？
- [ ] 动画时长是否在 150-400ms 范围内？
- [ ] 移动端触摸目标是否 ≥ 44px？
- [ ] 是否使用 shadcn 组件而非自建？
