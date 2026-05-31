# 成长第二大脑 — 项目摘要

> 最后更新：2026-06-01  
> GitHub: https://github.com/nitujinseditan/GrowthManagementPlatform  
> 分支: main

---

## 定位

一站式个人成长管理平台，小范围测试版。核心功能：私密笔记（Git 式版本管理）+ AI 成长教练 + 社区有根分享。

---

## 技术栈（简化版）

| 层面 | 选型 | 说明 |
|------|------|------|
| 框架 | Next.js 14 (App Router) | 前后端一体，API Routes 替代独立后端 |
| UI | React 18 + Tailwind CSS 3.4 | 手写组件，无组件库 |
| 数据库 | SQLite（sql.js WASM 版）+ Drizzle ORM | 零配置，`data/growth-second-brain.db` 单文件，无需 Docker |
| 认证 | NextAuth.js v5 (Credentials + JWT) | 邮箱密码登录，无 OAuth |
| AI | OpenAI SDK → GPT-4o-mini | 直调 API，无 RAG/pgvector |
| 版本对比 | diff 库（动态 import） | CommonJS 兼容需注意 |
| 包管理 | pnpm | |

---

## 项目结构

```
whatisthat/
├── src/
│   ├── app/
│   │   ├── (auth)/login, register      # 认证页面
│   │   ├── (dashboard)/notes/[id]      # 笔记 CRUD + 三栏（编辑/版本/AI）
│   │   ├── (dashboard)/community       # 社区浏览 + 帖子详情 + 评论
│   │   ├── api/                        # ~17 个 RESTful 端点
│   │   ├── layout.tsx                  # 根布局（SessionProvider）
│   │   ├── page.tsx                    # 首页（已登录→重定向/notes）
│   │   └── globals.css                 # Tailwind + 字体/行距
│   ├── components/
│   │   ├── ui/          # Button, Card, Input, Textarea, Modal, Badge, Spinner
│   │   ├── layout/      # Sidebar, AuthGuard, SessionProvider
│   │   ├── notes/       # NoteEditor, VersionHistory, DiffView, NoteCard
│   │   ├── community/   # PostCard, CommentSection, PublishDialog
│   │   └── ai/          # ChatPanel
│   └── lib/
│       ├── db/          # schema.ts (9表), init.ts (sql.js), queries/{notes,versions,tags,posts,comments}.ts
│       ├── auth/        # index.ts (NextAuth配置), session.ts, utils.ts
│       ├── ai/          # client.ts (OpenAI), conversation.ts
│       └── version/     # diff.ts
├── data/                # SQLite 数据库文件（gitignore）
├── .claude/CLAUDE.md    # UI 设计规范 + AI 协作原则
├── .vscode/mcp.json     # no-slop MCP 配置
├── CLAUDE.md            # 项目主配置（技术栈 + AI 协作原则）
├── PROJECT_SUMMARY.md   # 本文件
├── package.json
├── tailwind.config.ts
├── drizzle.config.ts
└── .env.local           # AUTH_SECRET, OPENAI_API_KEY（gitignore）
```

---

## 数据库（9 张表）

| 表 | 核心字段 | 说明 |
|----|---------|------|
| users | id, email, name, password_hash | bcrypt 12轮加密 |
| notes | id, user_id, title, current_version_id, is_public | 私密/公开标记 |
| note_versions | id, note_id, user_id, version_number, content, commit_message | Git 式不可变历史 |
| tags | id, name (UNIQUE) | |
| note_tags | note_id, tag_id (复合主键) | |
| posts | id, user_id, note_id, title, excerpt | note_id 可溯源 |
| comments | id, post_id, user_id, content | |
| ai_conversations | id, user_id, note_id | per-note 对话 |
| ai_messages | id, conversation_id, role, content | role ∈ {user, assistant} |

## Git 式版本管理逻辑

- **保存**：取 `MAX(version_number)+1`，插入新 `note_versions` 行，更新 `notes.current_version_id`
- **历史**：按 `version_number DESC` 列出，可多选对比
- **对比**：`diffLines(oldContent, newContent)` → 并排显示（红删绿增）
- **回退**：复制旧版本内容为新版本，commit_message 自动生成 `"回退到版本 {n}"`
- **原则**：历史不可变，永不删除版本行

---

## API 端点（~17 个）

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

## 路由（页面）

| 路径 | 说明 | Auth |
|------|------|------|
| / | 首页（已登录重定向 /notes） | 否 |
| /login | 登录 | 否 |
| /register | 注册 | 否 |
| /notes | 笔记列表 | 是 |
| /notes/new | 新建笔记 | 是 |
| /notes/[id] | 笔记详情（编辑/版本/AI 三栏） | 是 |
| /community | 帖子列表 | 否 |
| /community/[id] | 帖子详情 + 评论 | 否 |

---

## UI 设计规范（.claude/CLAUDE.md）

1. 极简浅色：背景 #fff/#f3f4f6，主按钮 #10b981 (emerald)
2. 字体：system-ui, -apple-system, Inter，行距 1.5，字号 ≥14px
3. 间距 8px 基数（4,8,16,24,32）
4. 圆角 8px（rounded-lg）
5. 留白充足（区块间 ≥24px）

---

## 已实现功能

- [x] 用户注册/登录（邮箱密码）
- [x] 笔记 CRUD + 标签
- [x] Git 式版本管理（保存→版本、历史、对比、回退）
- [x] AI 成长教练（per-note 对话、笔记内容作为上下文）
- [x] 社区发布（笔记→帖子，note_id 溯源）
- [x] 评论系统
- [x] 标签浏览
- [x] 全局 emerald 配色方案

## 待办

- [ ] AI API Key 未配置（.env.local 中 OPENAI_API_KEY 需填入真实 key）
- [ ] 无 PWA 支持
- [ ] 无移动端适配（响应式基础有，但未专门优化）
- [ ] 无数据加密（AES-256 端到端加密未实现）
- [ ] 无付费墙/许可控制
- [ ] 无模板市场
- [ ] 无 Docker 部署配置
- [ ] 标签目前只显示，笔记列表/社区无标签筛选 UI

## 启动

```bash
pnpm dev        # http://localhost:3000
pnpm build      # 生产构建（已验证通过）
```

## 环境变量（.env.local）

```
DATABASE_URL=file:./data/growth-second-brain.db
AUTH_SECRET=kjZTKxGDbX2QfL/uMtU1W+F+phddqQBjJuEGVbRun5E=
OPENAI_API_KEY=sk-your-api-key          # ← 需要替换
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 已知技术债务

1. `diff` 库是 CommonJS，构建时有 `Cannot set properties of undefined` 警告（运行时动态 import 正常）
2. `/api/posts` 使用 searchParams，Next.js 预渲染时报 DYNAMIC_SERVER_USAGE（运行时正常）
3. Drizzle Kit 需要 better-sqlite3 native 模块，Windows 无 VS 无法运行；建表改用手写 SQL
4. AuthGuard 用客户端 `useSession`，服务端 `auth()` 也做了验证（双重保护）
5. `saveToDisk()` 每次写操作后全量写入数据库文件，大规模场景需改为定时批量写入
