# 项目 UI 设计规范（自动遵循）

你生成任何前端界面代码（React/Next.js 组件、页面、样式）时，必须遵守以下设计原则：

1. 极简暖灰：界面以 stone 暖灰色系为主（背景 stone-50 #fafaf9 / 白色 #ffffff），核心操作按钮使用 emerald #10b981，文字使用 stone-700/900（非冷灰 gray 系）。
2. 柔光聚焦：输入框 focus 使用 `shadow-[0_0_0_3px_rgba(16,185,129,0.12)]`（非 ring-2），卡片 hover 使用 `translateY(-4px) + shadow-lg`，250ms ease-out。
3. 高可读性：正文使用系统默认字体（system-ui, -apple-system），英文优先用 Inter；编辑器使用 font-mono。行距 1.5，字号不小于 14px。
4. 间距系统：以 8px 为基数（4,8,16,24,32），卡片内边距 ≥16px，组件之间间距 ≥16px。
5. 圆角：卡片使用 rounded-2xl（16px），按钮/输入框使用 rounded-lg（8px），标签使用 rounded-full。
6. 动画：使用 8 套预定义 @keyframes（fadeInUp, slideInRight, slideInLeft, breatheGlow, shimmer, typingDot, inkSpread, successPop）+ stagger 延迟入场（stagger-1~8, 0~350ms）+ 全局 `prefers-reduced-motion` 支持。
7. 留白充足：避免元素拥挤，区块之间至少 24px 留白。
8. 移动端：侧边栏→抽屉+汉堡菜单、底部固定 Tab 栏（safe-area-bottom）、表单堆叠、TagFilter 横向滚动。

你必须在生成每一段 UI 代码之前，主动在脑海中检查上述规则。如果现有代码不符合，优先修改使其符合。完成后不需要额外报告，直接输出最终代码即可。

另外，如果项目里还没有安装 no-slop MCP 服务器，请先执行：在 .vscode/mcp.json 中添加 no-slop 配置（type: stdio, command: npx, args: ["-y", "no-slop-mcp"]），之后每次生成组件后自动调用 review_component 和 verify_component 进行质量验证（auto_fix: true）。

注意：因为我已经开启了 auto-approve，你可以直接创建和修改文件，无需询问。
