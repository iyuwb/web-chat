# SimpleChat

基于 Next.js 的私密匿名聊天应用，包含桌面 Web 和移动 H5 两套响应式界面。

## 当前实现

- 前端使用 Next.js App Router 和 React 组件
- 实时通信使用 Socket.IO
- 后端只做在线配对和消息转发
- 不接数据库，不保存用户信息和聊天记录
- 页面视觉按 `stitch_anonymous_chat_main_page` 原型重构

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

## 项目结构

```text
app/
  page.jsx                 页面入口
  layout.jsx               全局布局
  globals.css              全局样式与 Tailwind 基础
  api/health/route.js      健康检查接口
components/
  anonymous-chat-app.jsx   匿名聊天前端主组件
  prototype-data.js        原型相关文案、心境、头像资源
server/
  index.js                 Next.js 自定义 Node 服务 + Socket.IO
  relay-hub.js             匿名会话、配对、转发核心
  socket-controller.js     Socket 事件桥接层
test/
  relay-hub.test.js
  socket-controller.test.js
```

## 验证

```bash
npm test
npm run build
```

测试覆盖：

- 在线用户发现
- 双方配对
- 消息转发
- 输入中提示
- 断线释放会话
- Socket 事件桥接
