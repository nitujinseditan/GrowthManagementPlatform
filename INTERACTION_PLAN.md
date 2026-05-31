# INTERACTION_PLAN.md — 核心用户流程交互优化方案

> 基于 interaction-design 插件的 15 个 skills 框架，对五个核心流程进行交互分析与优化。

---

## 流程一：注册 → 登录 → 邮箱验证

### 现状分析
- 注册表单 4 个字段纵向排列，验证在提交时执行
- 登录表单 2 个字段，错误信息顶部显示
- 邮箱验证通过 URL 参数触发，无明确引导

### 问题
1. **缺乏即时验证反馈** — 密码强度、邮箱格式无实时提示（form-design: inline validation on blur）
2. **错误信息不精确** — "邮箱或密码错误"未区分具体原因（form-design: explain what went wrong and how to fix）
3. **验证邮件提示不够突出** — 成功后仅一行绿底文字，用户可能忽略
4. **登录态体验断层** — 注册后需要切到邮箱→点链接→再登录，中间缺乏上下文保持

### 优化方案

| 步骤 | 交互改进 | 对应 skill |
|------|---------|-----------|
| 输入邮箱时 | blur 时校验格式，正确显示 ✓ 绿色勾 | form-design: inline validation |
| 输入密码时 | 实时显示强度条（弱/中/强），6位以下红色提示 | form-design: success indication |
| 两次密码不一致 | 确认密码框下方实时红色提示（不等提交） | form-design: validate on blur |
| 注册成功 | 全屏居中的成功状态卡片（✅ + 标题 + 说明 + "去登录"按钮），不依赖小横幅 | feedback-patterns: confirmation feedback |
| 登录失败 | 区分"用户不存在"/"密码错误"/"邮箱未验证"，分别给出不同引导 | error-handling-ux: specific error recovery |
| 邮箱验证页 | 成功后3秒自动跳转登录 + 倒计时显示 | loading-states: transition behavior |

---

## 流程二：创建笔记 → 编辑 → 保存 → 版本历史

### 现状分析
- 编辑区单栏布局，版本历史在另一个 Tab
- 保存按钮在底部，标签在内容上方
- 版本历史为列表形式，每项显示版本号和提交信息

### 问题
1. **编辑与版本历史分离** — 用户无法边写边看历史（navigation-patterns: parallel views）
2. **保存反馈弱** — 按钮变"保存中..."后恢复，无成功确认（feedback-patterns: confirmation feedback）
3. **标签输入体验差** — 纯文本逗号分隔，容易打错、格式不一致（form-design: input type mismatch）
4. **版本列表信息密度低** — 无法快速感知版本间差异大小

### 优化方案

| 步骤 | 交互改进 | 对应 skill |
|------|---------|-----------|
| 标题输入 | 大字号（text-xl）、无边框（border-transparent），聚焦时底部 emerald 线出现 | form-design: field width reflects input length |
| 内容编辑 | 支持快捷键 Ctrl+S 保存，保存时按钮短暂变 ✓ "已保存" 后恢复 | feedback-patterns: immediate feedback |
| 标签输入 | 改为 Tag Input 组件：输入→回车添加→显示为可删除标签块 | form-design: match input to data type |
| 版本 Tab | 时间轴样式：垂直线 + 圆点 + 版本卡片，当前版本高亮 emerald 圆点 | navigation-patterns: local navigation |
| 版本对比 | 选择两个版本后，并排 diff 视图，差异行高亮（+绿/-红），滚动同步 | (现有 DiffView，增强视觉) |
| 回退操作 | 点击回退 → 弹出确认 toast（非 alert）→ 成功后自动切回编辑 Tab | feedback-patterns: undo instead of "are you sure?" |

---

## 流程三：发布笔记 → 社区浏览 → 评论互动

### 现状分析
- 发布通过 Modal 弹窗，填写标题和摘要
- 社区页搜索栏 + 帖子卡片网格
- 评论在帖子详情页底部

### 问题
1. **发布弹窗太简单** — 缺少预览和确认步骤（form-design: review step for high-stakes）
2. **帖子卡片信息层级混乱** — 标题、摘要、作者挤在一起
3. **搜索无结果时引导弱** — 仅一行文字
4. **评论提交无乐观更新** — 等待服务器返回才显示

### 优化方案

| 步骤 | 交互改进 | 对应 skill |
|------|---------|-----------|
| 发布按钮 | 笔记详情页顶部"发布到社区"按钮 → 点击弹出预览卡片 + 编辑标题/摘要 + 确认发布（两步流程） | form-design: multi-step for high-stakes |
| 帖子卡片 | 重构为：顶部作者行（首字母头像 + 昵称 + 相对时间）+ 标题 + 摘要（2行截断）+ 底部 stats（💬 N · ❤️ M）| feedback-patterns: status feedback |
| 搜索框 | 聚焦时宽度从 100% 微扩到 102%（subtle scale），placeholder 文字动画淡入 | micro-interaction-spec: trigger feedback |
| 搜索无结果 | 显示插画 + "未找到关于「xxx」的帖子" + "试试其他关键词" + 热门标签推荐 | search-ux: help users recover from failure |
| 评论提交 | 乐观更新：提交即显示（带加载指示器），失败回退 + 重试按钮 | loading-states: optimistic UI |
| 分页 | 改为"加载更多"按钮（而非传统分页），滚动到顶部 | navigation-patterns: contextual navigation |

---

## 流程四：AI 教练对话

### 现状分析
- 对话气泡样式，用户右侧绿色，AI 左侧白色
- 新对话按钮在右上角
- 输入框 + 发送按钮底部固定

### 问题
1. **新对话创建无确认** — 点击即创建，旧对话丢失（error-handling-ux: confirm before destructive）
2. **AI 响应等待体验差** — 无 typing indicator，突然出现回复
3. **空状态引导弱** — 仅一行灰色文字
4. **对话历史不可回溯** — 无法切换回之前的对话

### 优化方案

| 步骤 | 交互改进 | 对应 skill |
|------|---------|-----------|
| 空状态 | 显示 3 个建议问题按钮（"帮我复盘这篇笔记" / "提炼关键知识点" / "制定行动计划"），点击直接发送 | onboarding-design: get users to value quickly |
| 发送消息 | 用户气泡从右侧滑入（animate-slide-in-right），AI 回复前显示 typing dots 动画 | loading-states: skeleton/progress |
| AI 回复 | 逐字显示（typewriter 效果，前200ms延迟后开始，速度 ~30字/秒） | animation-principles: choreographed entrance |
| 新对话 | 点击 → 弹出确认（"当前对话将保存，确定开启新对话？"），确认后创建 | error-handling-ux: confirm before destructive action |
| 对话列表 | 显示历史对话标题 + 时间，支持切换（当前仅加载最新一条） | navigation-patterns: local navigation |

---

## 流程五：全局导航（侧边栏 / 移动端）

### 现状分析
- 桌面端：固定左侧 224px 侧边栏
- 移动端：汉堡菜单 → 抽屉（遮罩 + 滑入）
- 两个导航项：我的笔记、社区

### 问题
1. **导航项太少时视觉空洞** — 仅2项占据整个侧边栏高度
2. **移动端无底部 Tab** — 需要两步（汉堡→点击）才能导航（navigation-patterns: reachability）
3. **当前页指示弱** — 仅背景色变化，色盲用户可能区分困难
4. **退出登录在底部** — 误触风险，无确认

### 优化方案

| 步骤 | 交互改进 | 对应 skill |
|------|---------|-----------|
| 侧边栏布局 | 上部：品牌 Logo + 导航项 + 左侧指示条。中部：统计摘要（笔记数/帖子数）。下部：用户信息 + 设置 + 退出 | navigation-patterns: global + utility separation |
| 激活指示 | 左侧 3px emerald 竖条 + 文字加粗 + emerald-50 背景，三重指示（非仅颜色） | navigation-patterns: active states distinguishable by more than color |
| 移动端 | 底部固定 Tab 栏（笔记 / 社区 / 我的），3 项带图标，替换汉堡菜单为主导航方式 | navigation-patterns: tab bar for mobile 3-5 destinations |
| 退出确认 | 点击"退出登录" → 底部弹出确认 sheet（移动端）/ Popover（桌面端），确认后执行 | error-handling-ux: confirm before destructive |

---

## 六、全局微交互规范

基于 micro-interaction-spec 框架：

| 交互 | Trigger | Rules | Feedback | Duration |
|------|---------|-------|----------|----------|
| 按钮点击 | click | scale(0.97)→scale(1) | 视觉按压感 + 颜色加深 | 150ms |
| 卡片悬浮 | hover | translateY(-4px) + shadow-lg | 上浮 + 阴影扩散 | 250ms ease-out |
| 输入框聚焦 | focus | ring→shadow glow transition | emerald 光晕扩散 | 200ms |
| 页面加载 | on mount | 元素依次 fadeIn + slideUp (stagger 50ms) | 卡片逐个淡入 | 400ms total |
| 标签切换 | click | 指示条滑动 (transformX transition) | 底部条从旧位置滑到新位置 | 200ms ease-in-out |
| 删除操作 | click | 先弹出确认（非 window.confirm） | 红色高亮 + 二次确认 | — |
| AI 输入中 | system | 三个点依次弹跳 | 对方正在思考的动态感 | 循环至回复到达 |

---

## 七、可访问性增强

- 所有交互状态支持 `prefers-reduced-motion`：禁用动画，使用即时切换
- 聚焦指示不仅依赖颜色：emerald ring + offset（focus-visible: ring-2 ring-offset-2）
- 表单错误关联 `aria-describedby` 指向错误信息元素
- 移动端触摸目标最小 44×44px（WCAG 2.1）

---

## 八、实施优先级

| 优先级 | 流程 | 关键改动 |
|--------|------|---------|
| P0 | 全局微交互 | Button/Card/Input 基础交互、Toast 组件、动画系统 |
| P1 | 注册/登录 | 即时验证、成功状态卡片、错误区分 |
| P2 | 笔记编辑 | 标签输入组件、保存反馈、快捷键 |
| P3 | AI 对话 | 建议问题、typing 动画、新对话确认 |
| P4 | 导航 | 移动端底部 Tab、激活指示条、退出确认 |

