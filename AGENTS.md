# Repository Guidelines

## 项目结构与模块组织

`app/` 用于放置 Next.js App Router 的页面入口、全局样式，以及 `app/api/` 下的接口路由。可复用界面组件统一放在 `components/`；文件名以 kebab-case 为主，例如 `entry-screen.jsx`，导出的 React 组件使用 PascalCase。`server/` 保存匿名聊天的内存态会话与转发逻辑，`lib/` 放轻量工具函数，`test/` 放 Node 测试文件，例如 `relay-hub.test.js`。`stitch_anonymous_chat_main_page/` 仅作本地原型参考，不参与正式开发。

## 构建、测试与开发命令

- `npm install`：安装依赖。
- `npm run dev`：启动本地开发环境，默认地址为 `http://localhost:3000`。
- `npm run build`：执行生产构建，并提前暴露 App Router 或运行时问题。
- `npm start`：运行构建后的生产版本。
- `npm run lint`：执行 ESLint 检查。
- `npm test`：运行 `test/` 下的 `node:test` 测试套件。

提交 PR 前至少执行一次 `npm run lint`、`npm test` 和 `npm run build`。

## 编码风格与命名约定

默认遵循本地 `code-and-commit-standards` skill。项目使用现代 ESM JavaScript，统一保留分号、双引号和 2 空格缩进，并优先服从仓库现有的 lint、目录和命名约定。代码应以可读性优先于技巧性，函数保持小而单一职责，优先使用提前返回，避免过度封装和深层嵌套。数据结构与控制流尽量直接，删除无必要抽象；每次改动保持最小范围，只解决当前需求。React 页面和组件使用 `.jsx`，服务端和工具模块使用 `.js`。文件名优先 kebab-case，如 `chat-provider.jsx`；组件和导出构造函数使用 PascalCase，如 `EntryScreen`。App Router 默认保持 Server Component，只有需要 Hooks 或浏览器 API 时才添加 `"use client";`。

## 注释规范

只在表达意图、领域规则或不直观的权衡时添加注释。不要重复代码表面含义，也不要写“变量赋值”这类低信息注释。注释应简短、准确，并在逻辑变更时同步更新。

## 测试规范

测试框架为 Node 内置 `node:test`，断言使用 `node:assert/strict`。新增测试统一放在 `test/`，命名格式为 `*.test.js`。凡是修改聊天路由、SSE 会话生命周期、会话释放逻辑，或依赖源码结构的 UI 约束时，都要同步补充或更新测试。测试应保持确定性，不依赖外部网络或随机环境。

## 提交与 Pull Request 规范

当前提交历史以简洁的 Conventional Commits 为主，例如 `feat: ...`、`refactor: ...`。未被明确要求时，不要自行创建提交。建议格式为 `type(scope): subject`，例如 `fix(session): release partner on disconnect`；主题使用祈使句和现在时，保持简洁且不加句号。需要额外上下文时可补充 body；存在破坏性变更时使用 `BREAKING CHANGE:`。常用类型包括 `feat`、`fix`、`docs`、`refactor`、`test`、`build`、`ci` 和 `chore`。提交信息中不要提及 AI、助手或自动化。PR 说明应包含变更摘要、关联问题、已执行的验证命令；若涉及界面调整，还应附上截图或录屏。

## 安全与架构说明

本项目刻意保持“无持久化”设计：不接数据库、不保存用户资料、不存储聊天记录。修改功能时应优先维护这一约束，除非需求明确要求调整整体架构。
