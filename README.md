<!-- README.md · 中文（默认） -->

<div align="center">

<img src="web/assets/logo-mark.svg" width="72" alt="HTML Editor logo">

# 📝 HTML Editor · 协作修订你的 HTML

**拖入 HTML → 实时协作 → 导出给 AI 继续优化**

[![中文](https://img.shields.io/badge/语言-中文-3b82f6?style=flat-square)](./README.md)
[![English](https://img.shields.io/badge/English-Click-64748b?style=flat-square)](./README.en.md)
[![PartyKit](https://img.shields.io/badge/Powered%20by-PartyKit-aa30ff?style=flat-square)](https://partykit.io)
[![Yjs](https://img.shields.io/badge/Sync-Yjs-ffd602?style=flat-square)](https://yjs.dev)

</div>

---

## 🌟 一句话介绍

HTML Editor 是一个**轻量级、免注册的协作式 HTML 编辑工具**。你只需把 AI 生成的 `.html` 或 `.htm` 文件拖进页面，就能和团队一起在线修改文字、批注元素；改完后既可一键下载干净 HTML，也能把「代码 + 评论」打包成 Prompt 交给 AI，让它继续迭代。

> 想象一下：你像编辑在线文档一样编辑 HTML，所有改动实时同步，所有意见都留在页面上，最后还能把完整上下文一键喂给 AI。✨

---

## 🎬 三步开始

```
📤 拖入 HTML 文件
   ↓
🔗 复制分享链接给团队成员
   ↓
✏️ 一起编辑 / 批注 / 导出
```

1. **上传** 📤 — 把 `.html` 或 `.htm` 文件拖到首页，立刻生成一个协作房间。
2. **分享** 🔗 — 复制 URL，无需注册，任何人打开链接就能加入。
3. **协作** 🤝 — 实时编辑文本、给任意元素加批注，看见谁在同时在线。

---

## ✨ 核心亮点

| 功能 | 说明 |
|------|------|
| 🖱️ **零门槛上传** | 拖拽即可开始，支持 `.html` / `.htm`，单文件最大 2 MB。 |
| ⚡ **实时多人协作** | 基于 WebSocket + [Yjs CRDT](https://yjs.dev)，多人同时编辑不冲突。 |
| 💬 **元素级批注** | 选中任意元素即可留言，评论列表始终与页面一一对应。 |
| 🎨 **可视化编辑** | 编辑模式下直接改文字；样式工具栏可调整字体、颜色、对齐等。 |
| 📦 **两种导出** | 下载干净 HTML，或生成 Markdown Prompt 交给 AI 继续优化。 |
| 🐳 **Docker 一键运行** | 本地开发、私有化部署都只要一条命令。 |

---

## 🛠️ 技术栈

- **前端**：原生 HTML / CSS / JavaScript（无构建步骤）
- **实时同步**：PartyKit + Yjs（CRDT）
- **服务端**：PartyKit Durable Object（每个房间一个独立对象）
- **容器化**：Docker + Docker Compose
- **部署目标**：Vercel / Cloudflare Pages（前端静态托管）+ PartyKit（实时协作服务）

---

## 🚀 快速启动

### 方式一：本地 Node 开发

```bash
# 1. 安装依赖
npm install

# 2. 启动 PartyKit 开发服务器（同时托管 web 静态资源）
npm run dev
```

打开浏览器访问 `http://localhost:1214` 即可。

```bash
# 常用脚本
npm run dev          # 本地开发，端口 1214
npm run build        # 构建 Vercel 产物到 dist/
npm run build:worker # 构建 Cloudflare Worker 产物
npm run deploy       # 通过 Wrangler 部署实时协作服务到 party.lizezhen13.ccwu.cc
npm run deploy:partykit  # 使用 PartyKit CLI 部署自定义域名（备用）
npm run deploy:partykit:default  # 部署到 PartyKit 默认域名
npm run vercel       # 部署到 Vercel
npm run preview:web  # 仅预览静态前端（不启动 WebSocket）
```

### 方式二：Docker 运行

```bash
# 构建并启动容器
docker compose up -d --build

# 查看日志
docker compose logs -f

# 停止服务
docker compose down
```

服务默认运行在 `http://localhost:1214`。

> **国内镜像加速**：`docker-compose.yml` 默认使用 `docker.m.daocloud.io/library/node:20-slim` 作为基础镜像，并在容器内使用 `https://registry.npmmirror.com` 作为 npm 源。若你不需要国内镜像，可修改 `docker-compose.yml` 中的 `NODE_IMAGE` 参数，或删除/调整 `environment.npm_config_registry`。

### 方式三：部署到 Vercel

```bash
# 1. 安装 Vercel CLI（如未安装）
npm i -g vercel

# 2. 登录并部署
vercel
```

或者点击 **「Deploy with Vercel」** 按钮从 Git 仓库一键导入。

> **注意**：Vercel 只托管前端静态页面，实时协作服务仍需部署到 Cloudflare Worker / PartyKit。
>
> 当前配置会让前端页面继续部署在 `lizezhen13.ccwu.cc`，实时协作服务部署在 `party.lizezhen13.ccwu.cc`。
>
> 1. 确认 `party.lizezhen13.ccwu.cc` 已在你的 Cloudflare 账号下可用，并准备好 `CLOUDFLARE_ACCOUNT_ID` 和 `CLOUDFLARE_API_TOKEN`。
> 2. 部署实时协作服务：
>    ```bash
>    npm run deploy
>    ```
>    该命令会先执行 `scripts/build-cloudflare-worker.js`，再通过 `wrangler.toml` 中的 Worker route 和 `new_sqlite_classes` migration 发布 Durable Object。
> 3. 在 Vercel 控制台设置环境变量 `PARTYKIT_HOST=party.lizezhen13.ccwu.cc`，然后重新部署前端。
> 4. `scripts/build-vercel.js` 会在构建阶段把 `PARTYKIT_HOST` 注入到 `dist/src/collab.js` 的 `PARTYKIT_PROD` 中；若未设置，也会默认注入 `party.lizezhen13.ccwu.cc`。
>
> `vercel.json` 已配置路由：`/room.html` 直接访问，其余路径回退到 `index.html`。

---

## ⚙️ 环境变量

| 变量 | 说明 | 默认值 | 适用场景 |
|------|------|--------|----------|
| `PARTYKIT_HOST` | PartyKit 生产环境主机地址，例如 `party.lizezhen13.ccwu.cc` | `party.lizezhen13.ccwu.cc` | Vercel / 自定义静态托管 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账号 ID | 无 | Wrangler / PartyKit 自定义域名部署 |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | 无 | Wrangler / PartyKit 自定义域名部署 |
| `npm_config_registry` | npm 镜像源 | `https://registry.npmmirror.com` | Docker 构建 |

> 本地开发时一般不需要设置 `PARTYKIT_HOST`，因为 `collab.js` 会自动识别 `localhost`、`127.0.0.1`、内网 IP 和 `.partykit.dev` 为同域。

---

## 🏗️ 项目结构

```
HTML_Editor/
├── web/                  # 前端静态资源
│   ├── index.html        # 首页（上传入口）
│   ├── room.html         # 协作房间
│   ├── src/              # 前端业务脚本
│   ├── styles/           # 样式
│   ├── assets/           # 图标、Logo
│   └── vendor/           # 自托管的第三方库（Yjs / y-partykit）
├── party/
│   └── server.ts         # PartyKit 服务端
├── docs/                 # 设计文档与架构说明
│   ├── architecture.md   # 系统架构
│   ├── design-system.md  # 设计系统
│   └── roadmap.md        # 路线图
├── package.json
├── partykit.json
├── vercel.json              # Vercel 部署配置
├── scripts/
│   └── build-vercel.js      # Vercel 构建脚本
├── .vercelignore            # Vercel 部署忽略规则
├── Dockerfile
└── docker-compose.yml
```

---

## 🧠 架构速览

```
┌──────────────┐      WebSocket      ┌──────────────────┐
│   浏览器 A   │ ◄─────────────────► │  PartyKit Room   │
└──────────────┘                     │  (Durable Object)│
                                    └────────┬─────────┘
┌──────────────┐      WebSocket             │
│   浏览器 B   │ ◄────────────────────────────┘
└──────────────┘
```

- 每个房间对应一个 **PartyKit Durable Object**，天然保持长连接状态。
- 文档状态通过 **Yjs** 进行 CRDT 同步，断网重连后自动合并。
- HTML 被拆分为「骨架（skeleton）+ 可编辑块（blocks）」，既保留原结构，又支持细粒度实时协作。

详细架构请见 [`docs/architecture.md`](./docs/architecture.md)。

---

## 🗺️ 路线图

- [x] 首页拖拽上传与视觉原型
- [x] 协作房间 UI：编辑器、批注栏、状态条
- [x] 实时文本同步与评论同步
- [x] 用户身份（昵称 + 颜色）
- [x] 导出干净 HTML / 导出 AI Prompt
- [ ] 持久化到 R2 / KV
- [ ] 移动端只读浏览
- [ ] 房间元信息页面
- [ ] 公开部署与滥用防护

完整路线图请见 [`docs/roadmap.md`](./docs/roadmap.md)。

---

## 📝 使用技巧

- **切换语言**：首页右上角点击地球图标 🌐，可在 **中文 / English** 间切换，默认中文。
- **切换模式**：页面顶部可在「编辑模式」和「批注模式」间切换。
- **快捷键**：评论输入框中按 `⌘ + ↵`（Mac）或 `Ctrl + ↵`（Windows）快速保存。
- **导出给 AI**：点击「Export ▾」→「Hand off to AI」，把代码和评论一起复制给大模型。

