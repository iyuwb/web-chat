# ETHEREAL WHISPER

基于 Next.js App Router 的私密匿名聊天应用，支持桌面 Web 和移动 H5，自定义原型来自 `stitch_anonymous_chat_main_page/`。

## 设计原则

- 不使用数据库
- 不保存用户资料和聊天记录
- 后端只做内存中的会话匹配、消息转发和断线释放
- 关闭页面、断线或主动销毁后，会话立即失效

## 当前架构

- 前端：Next.js 16 + React 19 + Tailwind CSS
- 路由：App Router，页面默认使用 Server Components
- 客户端状态：根布局下的轻量 `ChatProvider`
- 实时通信：Route Handlers + Server-Sent Events + HTTP Actions
- 图标：`lucide-react`
- 图片：`next/image` + `remotePatterns`
- 代码质量：ESLint Flat Config + `eslint-config-next/core-web-vitals`

## 启动

```bash
npm install
npm run dev
```

默认地址：

```text
http://localhost:3000
```

生产构建：

```bash
npm run build
npm start
```

## 目录结构

```text
app/
  page.jsx                         入口页
  discover/page.jsx               发现页
  chat/page.jsx                   聊天页
  layout.jsx                      根布局 + Provider
  globals.css                     全局样式
  api/
    health/route.js               健康检查
    session/route.js              创建匿名会话
    session/disconnect/route.js   主动销毁会话
    events/route.js               SSE 事件流
    actions/route.js              聊天动作派发
components/
  entry-screen.jsx                入口页客户端交互
  discover-screen.jsx             发现页客户端交互
  chat-screen.jsx                 聊天页客户端交互
  chat-provider.jsx               全局会话状态与 SSE 管理
  app-chrome.jsx                  桌面侧边栏 / 移动底部导航
  avatar-image.jsx                统一头像组件
  prototype-data.js               原型文案、头像和格式化方法
server/
  relay-hub.js                    匿名会话与转发核心
  session-broker.js               SSE 订阅、排队和断线宽限层
  session-broker-store.js         Next 运行时单例入口
test/
  relay-hub.test.js
  session-broker.test.js
lib/
  cx.js                           样式拼接工具
```

## 验证

```bash
npm test
npm run lint
npm run build
```

已覆盖验证：

- 在线用户发现
- 双方匹配
- 消息转发
- 输入中提示
- SSE 断线宽限与会话释放
- 标准 `next start` 路径下的运行态冒烟

## 注意事项

- 当前实时层依赖单进程内存状态，适合本地运行和单实例部署
- `stitch_anonymous_chat_main_page/` 只作为本地原型参考，已忽略提交
