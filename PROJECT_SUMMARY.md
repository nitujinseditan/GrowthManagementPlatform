# 成长第二大脑 — 项目摘要

> 最后更新：2026-06-01（自动保存→退出提醒 + 设计系统 shadcn/ui + HSL 令牌）
> GitHub: https://github.com/nitujinseditan/GrowthManagementPlatform
> 分支: main
> 端口: 3722

---

## 一、项目定位

一站式个人成长管理平台，实现"私密沉淀 → 智能复盘 → 有根分享"的闭环。核心壁垒：私密与公开双模一体化 + AI 连接者。

当前阶段：完全免费 MVP，不实现任何付费功能。

---

## 二、技术栈

| 层面 | 选型 | 说明 |
|------|------|------|
| 框架 | Next.js 14 (App Router) | 前后端一体，API Routes 替代独立后端 |
| UI | React 18 + Tailwind CSS 3.4 + **shadcn/ui** (Radix) | shadcn/ui 组件库 + design tokens (HSL) + cva/cn 工具链 |
| 数据库 | SQLite（sql.js WASM 版）+ Drizzle ORM | `data/growth-second-brain.db` 单文件，零配置 |
| 认证 | NextAuth.js v5 (Credentials + JWT) | 邮箱密码登录 + 邮箱验证，含 CSRF 保护 |
| AI | DeepSeek API（compatible OpenAI SDK）| deepseek-v4-flash 日常 / deepseek-v4-pro 深度 |
| 邮件 | Nodemailer + Gmail SMTP | 注册邮箱验证码，开发环境可降级为控制台打印 |
| 版本对比 | diff 库（动态 import）| CommonJS 注意 |
| Markdown | react-markdown + remark-gfm + @tailwindcss/typography + rehype-highlight | 编辑器双栏预览 + 社区内容渲染 + 代码语法高亮 |
| 包管理 | pnpm | |
| 端口 | **3722**（固定） | `next dev -p 3722` |

---

## 三、项目结构

```
whatisthat/
├── src/
│   ├── app/
│   │   ├── (auth)/login, register
│   │   ├── (dashboard)/notes/[id]       # 编辑/版本/AI Tab 切换
│   │   ├── (dashboard)/community
│   │   ├── api/                         # ~18 个 RESTful 端点
│   │   ├── layout.tsx, page.tsx, globals.css
│   ├── components/
│   │   ├── ui/           # shadcn/ui 组件: Button, Card, Input, Textarea, Badge, Dialog, DropdownMenu, Toast, Toaster, Tooltip, Tabs, Separator, Skeleton + 自定义: Modal, Spinner, Toggle, QuickSwitcher
│   │   ├── layout/       # Sidebar, AuthGuard, SessionProvider, DashboardShell
│   │   ├── notes/        # NoteEditor, VersionHistory, DiffView, NoteCard, TagFilter, TableOfContents, SlashCommandMenu, slashCommands
│   │   ├── community/    # PostCard, CommentSection, PublishDialog
│   │   ├── ai/           # ChatPanel
│   │   └── markdown/     # MarkdownToolbar, MarkdownPreview, WritingStats
│   ├── hooks/            # useAutoSave, useDraftRecovery, useRelativeTime
│   └── lib/
│       ├── db/           # schema.ts, init.ts (sql.js), queries/{notes,versions,tags,posts,comments}.ts
│       ├── auth/         # NextAuth 配置, session.ts, utils.ts
│       ├── ai/           # DeepSeek client.ts, conversation.ts
│       ├── email/        # send.ts (nodemailer + Gmail SMTP)
│       ├── version/      # diff.ts
│       └── export.ts     # 导出 Markdown / PDF
├── data/                 # SQLite 数据库文件（gitignore）
├── scripts/              # 一次性脚本（gitignore）
├── .claude/CLAUDE.md     # UI 设计规范
├── CLAUDE.md             # 项目主配置 + 自检规则 + 功能边界
├── README.md             # 远期商业蓝图（仅供远景参考）
├── PROJECT_SUMMARY.md    # 本文件
└── .env.local / .env.example  # 环境变量（gitignore）
```

---

## 四、数据库（10 张表）

| 表 | 核心字段 | 说明 |
|----|---------|------|
| users | id, email, name, password_hash, **email_verified** | bcrypt 12轮，email_verified NULL=未验证 |
| notes | id, user_id, title, current_version_id, is_public, **is_pinned**, **deleted_at**, **description**, **cover_image_url**, **icon**, **last_saved_at** | 🆕 6 个阶段二新字段 |
| note_versions | id, note_id, user_id, version_number, content, commit_message | 不可变历史 |
| tags | id, name (UNIQUE) | |
| note_tags | note_id, tag_id (复合主键) | 多对多 |
| posts | id, user_id, note_id, title, excerpt | note_id 溯源 |
| comments | id, post_id, user_id, content | |
| ai_conversations | id, user_id, note_id | per-note 对话 |
| ai_messages | id, conversation_id, role, content | role ∈ {user, assistant} |
| **email_verifications** 🆕 | id, email, token, expires_at | 注册验证 token，10分钟过期 |

---

## 五、API 端点

| Method | Path | Auth | 说明 |
|--------|------|------|------|
| GET/POST | /api/auth/[...nextauth] | 否 | NextAuth |
| POST | /api/auth/register | 否 | 注册 → 发验证邮件 |
| **GET** 🆕 | **/api/auth/verify?token=** | 否 | **邮箱验证** |
| GET/POST | /api/notes | 是 | |
| GET/PATCH/**PUT**/DELETE | /api/notes/[id] | 是 | PATCH 支持 tags/pin/description/icon；**PUT ?action=restore 恢复**；DELETE 软删除 |
| GET/POST | /api/notes/[id]/versions | 是 | |
| GET | /api/notes/[id]/versions/[vid] | 是 | |
| GET | /api/notes/[id]/versions/diff?a=&b= | 是 | |
| POST | /api/notes/[id]/versions/[vid]/revert | 是 | |
| POST | /api/notes/[id]/publish | 是 | |
| GET | /api/posts | 否 | 支持 ?search= & ?tags= & ?page= |
| GET/DELETE | /api/posts/[id] | GET否/DEL是 | |
| GET/POST | /api/posts/[id]/comments | GET否/POST是 | |
| GET/POST | /api/notes/[id]/ai/conversations | 是 | |
| POST | /api/notes/[id]/ai/conversations/[cid]/messages | 是 | |
| GET | /api/tags | 否 | |

---

## 六、页面路由

| 路径 | 说明 | Auth |
|------|------|------|
| / | 首页（已登录→/notes） | 否 |
| /login | 登录 | 否 |
| /register | 注册（成功后提示查收验证邮件） | 否 |
| /notes | 笔记列表 + 标签筛选 | 是 |
| /notes/new | 新建笔记 | 是 |
| /notes/[id] | 笔记详情（编辑/版本/AI Tab 切换） | 是 |
| /community | 帖子列表 + **搜索栏** | 否 |
| /community/[id] | 帖子详情 + 评论 | 否 |

---

## 七、已实现功能

- [x] 用户注册/登录（邮箱密码 + CSRF 保护）
- [x] **邮箱验证** 🆕 — 注册后发验证邮件（Gmail SMTP），未验证不可登录
- [x] 笔记 CRUD + 标签（创建时可填标签，编辑时可修改）
- [x] 标签筛选 — 笔记列表顶部 TagFilter 组件，横向滚动，emerald 高亮选中
- [x] Git 式版本管理（保存→版本、历史列表、双版本对比、回退）
- [x] AI 成长教练（per-note 对话，笔记内容作上下文，DeepSeek API）
- [x] 社区发布（笔记→帖子，note_id 溯源，含评论系统）
- [x] **社区搜索** 🆕 — 关键词 LIKE 搜索标题+摘要，防抖 300ms
- [x] 全局 emerald 配色方案（#10b981 主色调）
- [x] **移动端响应式** 🆕 — 侧边栏→抽屉汉堡菜单、卡片单列、表单堆叠、TagFilter 横向滚动
- [x] **数据安全** 🆕 — 测试数据清理必须先备份 + SQL DELETE 精确删除，禁止 rm -f 删库
- [x] **UI 审美全面优化** 🆕 — 22 文件重构：stone 暖灰配色、emerald 柔光聚焦、卡片悬浮微交互、8 套 CSS 动画、即时表单校验、移动端底部 Tab 栏 + 抽屉侧边栏、时间轴版本历史、无障碍支持（prefers-reduced-motion/ARIA）→ [DESIGN_PLAN.md](DESIGN_PLAN.md) + [INTERACTION_PLAN.md](INTERACTION_PLAN.md) + [UI_OPTIMIZATION_SUMMARY.md](UI_OPTIMIZATION_SUMMARY.md)
- [x] **退出提醒** 🆕 — 替换自动保存，三层导航守卫（beforeunload 关闭标签页 + click 捕获拦截侧边栏/移动端Tab + popstate 拦截后退）+ shadcn Dialog 确认框（保存并离开/不保存离开/取消），脏状态追踪
- [x] **Markdown 编辑器** — 双栏实时预览、11→15 按钮工具栏、Ctrl+B/I/K 快捷键、写作统计
- [x] **设计系统全面升级** 🆕 — shadcn/ui 组件库 + HSL 设计令牌 + Radix 无障碍原语 + semantic color tokens (primary/secondary/muted/accent/card)
- [x] **编辑器专业化升级** 🆕 — 13 项新功能 + 6 个 Schema 新列：
  - ⏱ **自动保存** — ~~停笔 2 秒自动创建版本~~（已移除）→ 改为退出提醒（三层导航守卫 + Dialog 确认框，beforeunload / click 捕获 / popstate）
  - 📝 **草稿恢复** — localStorage 防抖保存 + 恢复/丢弃提示 banner
  - 🧘 **禅模式** — F11 全屏写作，隐藏所有 UI 干扰，Escape 退出
  - 📑 **目录导航** — 解析标题生成层级 TOC，点击跳转，IntersectionObserver 高亮当前章节
  - ⚡ **斜杠命令** — 输入 `/` 弹出 16 条分组命令面板，↑↓ 导航，Enter 选择，光标插入定位
  - 🔍 **快速切换器** — Ctrl+P 全局搜索笔记+标签，键盘导航，即时跳转
  - 📥 **导出** — 一键下载 .md 文件 / 浏览器打印 PDF + print CSS
  - 🎨 **代码语法高亮** — rehype-highlight + 自定义 stone/emerald 主题
  - 📌 **置顶** — 笔记列表 pin 排序 + 编辑器内一键切换
  - 🗑 **回收站** — 软删除（deleted_at）+ 恢复 API
  - 📝 **描述** — 笔记副标题/描述字段，blur 自动保存
  - 🎨 **封面/图标** — cover_image_url + icon 字段（icon 支持 emoji）
  - 🕐 **最近保存时间** — last_saved_at 字段，每次保存自动更新
  - 🧱 **4 个新 UI 组件** — Tooltip、DropdownMenu、Toast（Provider+hook）、Toggle

---

## 八、UI 设计规范（必须遵守）

1. **组件库**：使用 shadcn/ui（Radix 原语 + cva variants），`src/components/ui/` 目录；自定义组件用 `cn()` 合并类名
2. **设计令牌（HSL）**：所有颜色通过 CSS 变量引用（`--primary`, `--secondary`, `--muted`, `--accent`, `--background`, `--foreground` 等），Tailwind 用 `bg-primary`/`text-muted-foreground` 语义类
3. **极简暖灰**：背景 `hsl(var(--background))` (#fafaf9 stone-50)，主按钮 `hsl(var(--primary))` (emerald #10b981)
4. **柔光聚焦**：输入框 focus 使用 `focus-visible:ring-2 focus-visible:ring-ring` (shadcn 标准)，卡片悬浮 `hover:shadow-lg hover:-translate-y-1`
5. **字体**：system-ui, -apple-system, Inter，行距 1.5，字号 ≥14px；编辑器使用 font-mono
6. **间距**：8px 基数（4,8,16,24,32），卡片内边距 ≥16px（shadcn Card: p-6）
7. **圆角**：8px 基数（rounded-lg），卡片 rounded-xl，按钮/输入框 rounded-md
8. **动画**：Tailwind 配置集中注册 11 套 @keyframes + animate-* 工具类 + stagger 延迟 + zen-mode + print + prefers-reduced-motion
9. **留白**：区块间 ≥24px
10. **移动端**：触摸目标 ≥44px，底部 Tab 栏 fixed，侧边栏→抽屉

---

## 九、功能边界（MVP 阶段，铁律）

**不实现任何付费/变现功能**：无会员、无支付、无模板商城、无分成、无 AI 限频。所有功能对所有用户免费。数据库和 API 不得出现 `is_member`、`subscription_tier`、`ai_quota` 等字段。远期蓝图见 README.md。

---

## 十、已安装 Skills

| Skill | 状态 | 位置 |
|-------|------|------|
| frontend-design | ✅ 已安装+已使用 | `~/.claude/skills/frontend-design/SKILL.md` — 已用于 UI 全面优化（参见 DESIGN_PLAN.md） |
| interaction-design | ✅ 已安装+已使用 | `~/.claude/skills/interaction-design/`（来源: Owl-Listener/designer-skills，15 skills + 3 commands）— 已用于交互流程优化（参见 INTERACTION_PLAN.md） |
| planning-with-files | ⚠️ 非标准 skill | 手动使用 `.claude/plan.md` 管理上下文 |

---

## 十一、已修复的 Bug

| Bug | 根因 | 修复 |
|-----|------|------|
| `notes.map is not a function` | `/api/notes` 中 `getNotesByUser()` 缺 `await` | 加 `await` |
| **14 处缺 `await`** | 10 个 API 路由文件系统性遗漏 async/await | 全部补上 |
| 注册失败 "数据库尚未初始化" | `register/route.ts` 直接 import `db`（lazy proxy） | 改为 `await initDb()` + `saveToDisk()` |
| sql.js WASM webpack 报错 | sql.js 在 Next.js webpack 打包时 `module.exports` 被破坏 | `next.config.mjs` 添加 `externals: ["sql.js"]` |
| `updatedAt.toLocaleDateString is not a function` | API JSON 序列化后 Date 变字符串 | `NoteCard` 加 `new Date()` 包裹 |
| 保存按钮分行 | flex-1 输入框挤压按钮 | Button 加 `whitespace-nowrap`；NoteEditor 按钮加 `shrink-0` |
| PATCH 标签 500 | Drizzle sql.js `delete().run()` 复合主键表偶发不生效 | 已验证，实际为 curl 中文编码问题（浏览器正常） |
| 测试脏数据残留 | sql.js `Buffer.from(Uint8Array)` 损坏数据 + 服务内存缓存 | 逐字节复制写盘 + 重启服务 |
| 测试删库导致用户数据丢失 🆕 | `rm -f` 删除整个 DB 文件 | 改为 SQL DELETE 精确删除 + 先 cp 备份 |

---

## 十二、待办

- [ ] PWA 支持
- [ ] Docker 部署配置
- [ ] AES-256 端到端数据加密
- [ ] 社区页面标签筛选（被搜索功能替代，待评估是否仍需）
- [ ] 笔记列表分页（当前全量加载，数据量大时需要）
- [ ] TypeScript strict 模式完善

---

## 十三、已知技术债务

1. `diff` 库 CommonJS，构建 `Cannot set properties of undefined` 警告（运行时正常）
2. `/api/posts` 使用 searchParams，预渲染 DYNAMIC_SERVER_USAGE 警告（运行时正常）
3. Drizzle Kit 需 better-sqlite3 native 模块，Windows 无 VS 无法运行；建表手写 SQL
4. `saveToDisk()` 每次全量写盘，量大了需改定时批量
5. sql.js `Buffer.from(Uint8Array)` 数据损坏，需逐字节复制
6. Next.js HMR 编译后模块级 `_db` 缓存可能过期，重启服务可解决
7. `skills-installer` 在 Windows 下 TTY 不兼容（`uv_tty_init EBADF`），交互操作不可用
8. `rehype-highlight` 无自带 CSS，需手动定义 highlight.js 主题类名（.hljs-*）

---

## 十四、AI 协作规则摘要

详见 [CLAUDE.md](CLAUDE.md)，核心要点：

1. **功能边界**：不做付费功能
2. **Git 提交规则**：每次修改后立即 `git add -A && git commit -m "中文" && git push origin main`
3. **自检 7 步**：启动→健康检查→API 测试→数据库完整性→lint→手动操作→**先备份再清理测试数据**
4. **端口固定**：3722
5. **测试不留痕**：禁止 `rm -f` 删库，必须 SQL DELETE + 先 `cp` 备份
6. **无 lint error**：warning 可忽略，error 必须修

---

## 十五、环境变量（.env.local）

```
DATABASE_URL=file:./data/growth-second-brain.db
AUTH_SECRET=kjZTKxGDbX2QfL/uMtU1W+F+phddqQBjJuEGVbRun5E=
DEEPSEEK_API_KEY=sk-18c9e09609d14f3aa79219e9da1b4e6b
NEXT_PUBLIC_APP_URL=http://localhost:3722
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=lushizuo722@gmail.com
EMAIL_PASS=<应用专用密码>
EMAIL_FROM=lushizuo722@gmail.com
```

## 十六、启动

```bash
pnpm dev        # http://localhost:3722
pnpm build      # 生产构建
pnpm lint       # ESLint 检查
```
