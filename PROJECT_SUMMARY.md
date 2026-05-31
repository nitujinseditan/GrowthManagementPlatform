# 成长第二大脑 — 项目摘要

> 最后更新：2026-06-01  
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
| UI | React 18 + Tailwind CSS 3.4 | 手写组件，无第三方 UI 库 |
| 数据库 | SQLite（sql.js WASM 版）+ Drizzle ORM | `data/growth-second-brain.db` 单文件，零配置 |
| 认证 | NextAuth.js v5 (Credentials + JWT) | 邮箱密码登录，含 CSRF 保护 |
| AI | DeepSeek API（compatible OpenAI SDK）| deepseek-v4-flash 日常 / deepseek-v4-pro 深度 |
| 版本对比 | diff 库（动态 import）| CommonJS 注意 |
| 包管理 | pnpm | |
| 端口 | **3722**（固定） | `next dev -p 3722` |

---

## 三、项目结构

```
whatisthat/
├── src/
│   ├── app/
│   │   ├── (auth)/login, register
│   │   ├── (dashboard)/notes/[id]       # 三栏：编辑/版本/AI
│   │   ├── (dashboard)/community
│   │   ├── api/                         # ~17 个 RESTful 端点
│   │   ├── layout.tsx, page.tsx, globals.css
│   ├── components/
│   │   ├── ui/           # Button, Card, Input, Textarea, Modal, Badge, Spinner
│   │   ├── layout/       # Sidebar, AuthGuard, SessionProvider
│   │   ├── notes/        # NoteEditor, VersionHistory, DiffView, NoteCard, TagFilter
│   │   ├── community/    # PostCard, CommentSection, PublishDialog
│   │   └── ai/           # ChatPanel
│   └── lib/
│       ├── db/           # schema.ts, init.ts (sql.js), queries/{notes,versions,tags,posts,comments}.ts
│       ├── auth/         # NextAuth 配置, session.ts, utils.ts
│       ├── ai/           # DeepSeek client.ts, conversation.ts
│       └── version/      # diff.ts
├── data/                 # SQLite 数据库文件（gitignore）
├── .claude/CLAUDE.md     # UI 设计规范
├── CLAUDE.md             # 项目主配置 + 自检规则 + 功能边界
├── README.md             # 远期商业蓝图（仅供远景参考）
├── PROJECT_SUMMARY.md    # 本文件
└── .env.local            # AUTH_SECRET, DEEPSEEK_API_KEY（gitignore）
```

---

## 四、数据库（9 张表）

| 表 | 核心字段 | 说明 |
|----|---------|------|
| users | id, email, name, password_hash | bcrypt 12轮 |
| notes | id, user_id, title, current_version_id, is_public | |
| note_versions | id, note_id, user_id, version_number, content, commit_message | 不可变历史 |
| tags | id, name (UNIQUE) | |
| note_tags | note_id, tag_id (复合主键) | 多对多 |
| posts | id, user_id, note_id, title, excerpt | note_id 溯源 |
| comments | id, post_id, user_id, content | |
| ai_conversations | id, user_id, note_id | per-note 对话 |
| ai_messages | id, conversation_id, role, content | role ∈ {user, assistant} |

---

## 五、API 端点

| Method | Path | Auth |
|--------|------|------|
| GET/POST | /api/auth/[...nextauth] | 否 |
| POST | /api/auth/register | 否 |
| GET/POST | /api/notes | 是 |
| GET/PATCH/DELETE | /api/notes/[id] | 是 |
| GET/POST | /api/notes/[id]/versions | 是 |
| GET | /api/notes/[id]/versions/[vid] | 是 |
| GET | /api/notes/[id]/versions/diff?a=&b= | 是 |
| POST | /api/notes/[id]/versions/[vid]/revert | 是 |
| POST | /api/notes/[id]/publish | 是 |
| GET | /api/posts | 否 |
| GET/DELETE | /api/posts/[id] | GET否/DEL是 |
| GET/POST | /api/posts/[id]/comments | GET否/POST是 |
| GET/POST | /api/notes/[id]/ai/conversations | 是 |
| POST | /api/notes/[id]/ai/conversations/[cid]/messages | 是 |
| GET | /api/tags | 否 |

---

## 六、页面路由

| 路径 | 说明 | Auth |
|------|------|------|
| / | 首页（已登录→/notes） | 否 |
| /login | 登录 | 否 |
| /register | 注册 | 否 |
| /notes | 笔记列表 + **标签筛选** | 是 |
| /notes/new | 新建笔记 | 是 |
| /notes/[id] | 笔记详情（编辑/版本/AI 三栏） | 是 |
| /community | 帖子列表 | 否 |
| /community/[id] | 帖子详情 + 评论 | 否 |

---

## 七、已实现功能

- [x] 用户注册/登录（邮箱密码 + CSRF 保护）
- [x] 笔记 CRUD + 标签（创建时可填标签，编辑时可修改）
- [x] **标签筛选** — 笔记列表顶部 TagFilter 组件，点击标签筛选，支持多选（OR）
- [x] Git 式版本管理（保存→版本、历史列表、双版本对比、回退）
- [x] AI 成长教练（per-note 对话，笔记内容作上下文，DeepSeek API）
- [x] 社区发布（笔记→帖子，note_id 溯源，含评论系统）
- [x] 全局 emerald 配色方案（#10b981 主色调）

---

## 八、UI 设计规范（必须遵守）

1. **极简浅色**：背景 #fff/#f3f4f6，主按钮 emerald #10b981
2. **字体**：system-ui, -apple-system, Inter，行距 1.5，字号 ≥14px
3. **间距**：8px 基数（4,8,16,24,32），卡片内边距 ≥16px
4. **圆角**：8px（rounded-lg）
5. **留白**：区块间 ≥24px

---

## 九、功能边界（MVP 阶段，铁律）

**不实现任何付费/变现功能**：无会员、无支付、无模板商城、无分成、无 AI 限频。所有功能对所有用户免费。数据库和 API 不得出现 `is_member`、`subscription_tier`、`ai_quota` 等字段。远期蓝图见 README.md。

---

## 十、本次会话修复的 Bug（全部已修）

| Bug | 根因 | 修复 |
|-----|------|------|
| `notes.map is not a function` | `/api/notes` 中 `getNotesByUser()` 缺 `await`，返回 Promise 而非数组 | 加 `await` |
| **14 处缺 `await`** | 10 个 API 路由文件系统性遗漏 async/await | 全部补上 |
| 注册失败 "数据库尚未初始化" | `register/route.ts` 直接 import `db`（lazy proxy），未调 `initDb()` | 改为 `await initDb()` + `saveToDisk()` |
| sql.js WASM webpack 报错 | sql.js 在 Next.js webpack 打包时 `module.exports` 被破坏 | `next.config.mjs` 添加 `externals: ["sql.js"]` |
| `updatedAt.toLocaleDateString is not a function` | API JSON 序列化后 Date 变字符串 | `NoteCard` 加 `new Date()` 包裹 |
| 保存按钮分行 | flex-1 输入框挤压按钮 | Button 加 `whitespace-nowrap`；NoteEditor 按钮加 `shrink-0` |
| PATCH 标签 500 | Drizzle sql.js `delete().run()` 复合主键表偶发不生效 | 已验证，实际为 curl 中文编码问题（浏览器正常） |
| 测试脏数据残留 | sql.js `Buffer.from(Uint8Array)` 损坏数据 + 服务内存缓存 | 逐字节复制写盘 + 重启服务 |

---

## 十一、新增功能（本次会话）

- **TagFilter 组件** — 笔记列表顶部标签筛选栏，横向 pill 按钮，emerald 高亮选中
- **NoteEditor 标签字段** — 独立的标签输入框（逗号分隔），创建和编辑时均可填写/修改
- **`setNoteTags()` 函数** — 数据库层，先删后插标签关联
- **PATCH /api/notes/[id] 支持 tags** — 编辑笔记时可更新标签

---

## 十二、待办

- [ ] 移动端响应式优化
- [ ] PWA 支持
- [ ] Docker 部署配置
- [ ] AES-256 端到端数据加密
- [ ] 社区页面标签筛选

---

## 十三、已知技术债务

1. `diff` 库 CommonJS，构建 `Cannot set properties of undefined` 警告（运行时正常）
2. `/api/posts` 使用 searchParams，预渲染 DYNAMIC_SERVER_USAGE 警告（运行时正常）
3. Drizzle Kit 需 better-sqlite3 native 模块，Windows 无 VS 无法运行；建表手写 SQL
4. `saveToDisk()` 每次全量写盘，量大了需改定时批量
5. sql.js `Buffer.from(Uint8Array)` 数据损坏，需逐字节复制
6. Next.js HMR 编译后模块级 `_db` 缓存可能过期，重启服务可解决

---

## 十四、AI 协作规则摘要

详见 [CLAUDE.md](CLAUDE.md)，核心要点：

1. **功能边界**：不做付费功能
2. **自检 7 步**：启动→健康检查→API 测试→数据库完整性→lint→手动操作→**清理测试数据**
3. **端口固定**：3722
4. **测试不留痕**：所有 curl/API 测试产生的用户、笔记、标签必须在交付前删除
5. **无 lint error**：warning 可忽略，error 必须修

---

## 十五、环境变量（.env.local）

```
DATABASE_URL=file:./data/growth-second-brain.db
AUTH_SECRET=kjZTKxGDbX2QfL/uMtU1W+F+phddqQBjJuEGVbRun5E=
DEEPSEEK_API_KEY=sk-18c9e09609d14f3aa79219e9da1b4e6b
NEXT_PUBLIC_APP_URL=http://localhost:3722
```

## 十六、启动

```bash
pnpm dev        # http://localhost:3722
pnpm build      # 生产构建
pnpm lint       # ESLint 检查
```
