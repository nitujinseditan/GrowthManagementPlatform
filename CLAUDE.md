# 成长第二大脑 — CLAUDE.md

## 项目定位
一站式个人成长管理平台，实现"私密沉淀 → 智能复盘 → 有根分享"的闭环。核心壁垒：私密与公开双模一体化 + AI 连接者。

## 技术栈（简化版，小范围测试用）
- **框架**: Next.js 14 (App Router) — 前后端一体，API Routes 替代独立后端
- **UI**: React 18 + Tailwind CSS
- **认证**: NextAuth.js v5 (Credentials Provider, JWT 策略)
- **数据库**: SQLite (sql.js WASM 版) + Drizzle ORM — 零配置单文件，无需 Docker
- **AI**: OpenAI API 直调 (GPT-4o-mini)，不做 RAG
- **版本对比**: diff 库

## 项目结构
```
whatisthat/
├── src/
│   ├── app/
│   │   ├── (auth)/login, register    # 认证页面
│   │   ├── (dashboard)/notes/[id]    # 笔记 CRUD + 版本管理
│   │   ├── (dashboard)/community     # 社区浏览
│   │   ├── api/                      # ~17 个 API 端点
│   │   ├── layout.tsx                # 根布局
│   │   ├── page.tsx                  # 首页
│   │   └── globals.css               # 全局样式
│   ├── components/
│   │   ├── ui/                       # 基础组件 (Button, Card, Input, Modal...)
│   │   ├── layout/                   # 布局组件 (Sidebar, AuthGuard)
│   │   ├── notes/                    # 笔记组件 (Editor, VersionHistory, DiffView)
│   │   ├── community/                # 社区组件 (PostCard, CommentSection)
│   │   └── ai/                       # AI 组件 (ChatPanel)
│   └── lib/
│       ├── db/                       # 数据库 schema + 查询函数
│       ├── auth/                     # NextAuth 配置
│       ├── ai/                       # OpenAI client + 对话编排
│       └── version/                  # diff 计算
├── data/                             # SQLite 数据库文件 (不提交 git)
├── package.json
├── tailwind.config.ts
└── drizzle.config.ts
```

## 数据库（9 张表）
users, notes, note_versions, tags, note_tags, posts, comments, ai_conversations, ai_messages

## Git 式版本控制
- 每次保存 = 创建新 note_version 行（内容全量快照）
- 历史不可变：回退 = 创建新版本，内容复制自旧版本
- 版本对比：用 diff 库计算行级差异
- 提交信息：每次保存可附加 commit_message

## 开发约定
- 使用 pnpm 作为包管理器
- TypeScript strict mode
- 所有用户文档使用中文
- 代码注释使用中文（复杂逻辑处）
- 提交消息使用中文

## 启动命令
```bash
pnpm dev          # 启动开发服务器 → localhost:3000
pnpm build        # 生产构建
```

---

## AI 协作开发原则

以下原则适用于本项目的所有对话，Claude Code 应默认遵循：

1. **目标驱动，而非实现细节**  
   用户会告诉你"要做什么"，而不是"怎么写代码"。你需要主动补全实现方案，并选择最适合新手、最简单的技术栈。不要反问"你想用什么技术栈"，而是直接给出推荐并解释理由。

2. **小步快跑，分步交付**  
   不要一次性输出整个大型项目。每次只完成一个可独立验证的功能模块，并给出验证方法（例如访问某个 URL、运行某个命令）。用户验证通过后再继续下一步。

3. **提供完整可执行的命令**  
   给出的所有命令（创建文件夹、安装依赖、构建镜像、运行容器等）必须完整、可直接复制粘贴到 Windows PowerShell 或 CMD 中执行。不要只给代码片段。

4. **主动要求上下文**  
   如果用户没有明确说明环境（操作系统、已安装的软件、已占用的端口、已有的 Docker 容器），你应该主动询问或基于常见情况给出兼容性建议（例如避免使用 8080 等易冲突端口）。

5. **错误处理闭环**  
   用户执行命令后如果报错，用户会把错误信息发给你。你需要分析错误原因，给出修正后的命令或操作步骤。不要假设用户能自己解决。

6. **技术栈选择由你负责**  
   用户不熟悉技术栈，你应根据需求自动选择最简单、维护成本最低的方案（例如 SQLite 替代 PostgreSQL，纯 HTML+JS 替代 React）。选择后简要说明理由。

7. **每次输出优先保证"能跑起来"**  
   在满足需求的前提下，优先保证用户能立即看到运行结果（哪怕是命令行输出），然后再考虑扩展性、性能等。
