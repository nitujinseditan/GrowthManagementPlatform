# 成长第二大脑 — CLAUDE.md

## 项目定位
一站式个人成长管理平台，实现"私密沉淀 → 智能复盘 → 有根分享"的闭环。核心壁垒：私密与公开双模一体化 + AI 连接者。

## 技术栈
- **前端**: React 18 + Next.js 14 (App Router) + Tailwind CSS + Zustand + TanStack Query
- **后端**: Node.js + NestJS (TypeScript)
- **数据库**: PostgreSQL 15 + Redis + pgvector
- **AI**: OpenAI/Claude API + RAG
- **部署**: Vercel (Web) + Railway (API) → 后期迁移 K8s
- **桌面端**: Tauri v2 (后期)
- **移动端**: React Native (后期)

## 项目结构
```
whatisthat/
├── apps/
│   ├── web/          # Next.js 14 前端
│   └── api/          # NestJS 后端
├── packages/
│   └── shared/       # 共享类型、常量、工具
├── pnpm-workspace.yaml
└── package.json
```

## 开发约定
- 使用 pnpm 作为包管理器
- TypeScript strict mode
- 所有用户文档使用中文
- 代码注释使用中文（复杂逻辑处）
- 提交消息使用中文

## MVP 首发决策
1. 先 Web + PWA，原生 App 稍后
2. AI 先用 API 直接调用 + prompt engineering + RAG，不做微调
3. 社区从单一垂类（考研）起步
4. Serverless 起步：Vercel + Railway/Render

## 核心模块
1. 私密沉淀端 — 极简记录、智能标签、成长时间线
2. 公开社区端 — 有根分享、成长朋友圈、模板市场
3. AI 成长教练 — 复盘引导、知识诊断、阶段报告
