# 成长第二大脑 — CLAUDE.md

## 项目定位
一站式个人成长管理平台，实现"私密沉淀 → 智能复盘 → 有根分享"的闭环。核心壁垒：私密与公开双模一体化 + AI 连接者。

## 技术栈（简化版，小范围测试用）
- **框架**: Next.js 14 (App Router) — 前后端一体，API Routes 替代独立后端
- **UI**: React 18 + Tailwind CSS
- **认证**: NextAuth.js v5 (Credentials Provider, JWT 策略)
- **数据库**: SQLite (sql.js WASM 版) + Drizzle ORM — 零配置单文件，无需 Docker
- **AI**: DeepSeek API 直调 (deepseek-v4-flash 日常 / deepseek-v4-pro 深度报告)，不做 RAG
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
│       ├── ai/                       # DeepSeek client + 对话编排
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

## 功能边界（MVP 阶段）

当前阶段为完全免费的 MVP，**不实现任何付费/变现功能**。以下内容明确排除：

- ❌ 会员订阅 / 付费墙
- ❌ 微信支付、Stripe 或其他支付接口
- ❌ 模板商城购买 / 付费模板
- ❌ 创作者分成 / 提现
- ❌ AI 调用次数限制 / 高级功能解锁

所有功能对所有用户完全免费开放，无任何支付门槛。数据库 schema、API 路由、前端组件均不得引入付费相关字段或逻辑（如 `is_member`、`subscription_tier`、`ai_quota` 等）。

> 远期商业画布（README.md）中的收入来源仅为未来设想，MVP 完成后由用户决定是否引入。

## 启动命令
```bash
pnpm dev          # 启动开发服务器 → localhost:3722
pnpm build        # 生产构建
```

---

## Git 提交规则（必须遵守）

**每次代码修改完成后，必须立即提交到 GitHub。** 无论是修改一个文件还是多个文件，无论是修 bug 还是加功能，修改完成并验证通过后，必须执行：

```bash
git add -A
git commit -m "<中文提交信息，描述本次改动>"
git push origin main
```

不允许累积多次修改后一次性提交。每次独立修改 = 一次独立提交 + 一次独立推送。

---

## 交付前强制自检规则（必须遵守）

在每次修改代码并交付给用户之前，你必须执行以下自检步骤，**只有全部通过后才能输出"验证通过，可以交付"**：

### 1. 启动验证
在项目根目录运行 `pnpm dev`，确保 Next.js 开发服务器能在 30 秒内成功启动，终端无红色报错（warning 可忽略）。

### 2. 健康检查
使用 `curl http://localhost:3722` 或 `npx wait-on http://localhost:3722` 确认主页可访问，返回状态码 200。

### 3. 关键 API 测试
- **注册**：`curl -X POST http://localhost:3722/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"123456","name":"Test"}'` 应返回 200 或 201。
- **登录**：`curl -X POST http://localhost:3722/api/auth/callback/credentials -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"123456","redirect":false}'` 应返回 200 并包含 `user` 对象。
- **获取笔记列表**：使用上述登录返回的 cookie 或 session token 调用 `/api/notes`，应返回 200 和数组（可能为空）。

### 4. 数据库完整性
使用 sql.js 确认所有必需表（users, notes, note_versions, tags, note_tags, posts, comments, ai_conversations, ai_messages）已创建。

### 5. 无 lint 严重错误
运行 `pnpm lint`，确保无 `error` 级别问题（warning 不阻塞）。

### 6. 模拟用户核心操作（手动验证）
- 打开浏览器访问 `http://localhost:3722`，点击注册，填写信息，提交。
- 注册成功后自动登录，跳转到 `/notes` 页面。
- 点击"新建笔记"，输入标题和内容，保存。
- 验证笔记出现在列表中，点击进入详情页，能看到版本历史。

### 7. 测试数据清理（必须执行）

> ⚠️ **清理前必须先备份数据库**：
> ```bash
> cp data/growth-second-brain.db data/growth-second-brain.db.bak
> ```

自检过程中产生的所有测试数据（测试用户、测试笔记、测试标签等）**必须在交付前从数据库中清除**，不得留痕。清理步骤：

- **禁止 `rm -f` 删除整个数据库文件**，必须使用 SQL `DELETE` 精确删除
- 自检用的测试用户（如 `test@example.com`）及其创建的笔记、版本、标签关联 → 全部删除
- 自检产生的孤立标签 → 删除（`DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM note_tags)`）
- 清理后再次确认 `users` 表中只保留真实用户

> ⚠️ 禁止以"终端编码问题，浏览器端不受影响"为由跳过实际验证。curl 测试中文标签时若出现编码问题，改用 ASCII 标签完成测试后清理。

如果任何一步失败，**你必须自动修复代码并重新验证**，直到全部通过后才交付。可以在后台静默执行这些步骤，最终只需告诉用户"自检通过"以及测试结果摘要。

---

## 设计协作

- **frontend-design**：✅ 已安装（`~/.claude/skills/frontend-design/SKILL.md`），暂未启用，后续需要时通过 `/frontend-design` 激活。
- **interaction-design**：✅ 已安装（`~/.claude/skills/interaction-design/`），来源 [Owl-Listener/designer-skills](https://github.com/Owl-Listener/designer-skills)，含 15 个 skills + 3 个 commands：
  - Skills: micro-interaction-spec, animation-principles, state-machine, gesture-patterns, error-handling-ux, loading-states, feedback-patterns, hicks-law, millers-law, fitts-law, doherty-threshold, form-design, onboarding-design, navigation-patterns, search-ux
  - Commands: `/design-interaction`, `/map-states`, `/error-flow`

---

## 上下文管理

### 规划文件方法（planning-with-files）

`planning-with-files` 并非可通过 skills-installer 安装的标准技能，而是 Claude Code 的一种上下文管理最佳实践。其核心思路：

1. **创建计划文件**：在项目根目录写入 `plan.md`，用 `<plan>` 标签描述当前任务、待办列表、关键决策。
2. **更新进度**：每完成一步，更新 `plan.md` 中的对应条目（标记完成、追加备注）。
3. **跨会话恢复**：新会话开始时，先读取 `plan.md` 恢复上下文，避免重复讨论。

手动使用方式：
- 开始复杂任务时 → 写入 `.claude/plan.md`，列出步骤
- 每完成一步 → 编辑 `plan.md` 标记 `[x]`
- 新会话 → 先 `Read .claude/plan.md` 恢复状态

---

## Slash Commands 参考（最佳实践）

以下是从 Claude Code 社区最佳实践中提炼的常用命令模式，适合本项目工作流：

| 命令 | 用途 | 本项目场景 |
|------|------|-----------|
| `/review` | 审查当前变更，检查 bug 和代码质量 | 提交前手动审查 PR 级别变更 |
| `/fix` | 修复审查发现的问题 | 联动 /review 使用 |
| `/commit` | 生成规范提交信息并提交 | 代替手动 git commit（遵守中文提交约定） |
| `/test` | 运行 `pnpm dev` + curl 关键 API | 快速验证改动不破坏现有功能 |
| `/clean` | 清理测试数据（精确 SQL DELETE） | 交付前执行，先 `cp` 备份数据库 |
| `/plan` | 写入任务计划到 `.claude/plan.md` | 复杂多步骤任务开始前 |
| `/status` | 输出当前分支、最近提交、数据库状态摘要 | 会话开始时快速定位 |

> 以上命令为参考模板，具体实现需根据项目实际情况调整。核心原则：小步提交、每次修改后立即 push、测试数据不留痕。
