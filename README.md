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
- **部署目标**：Cloudflare Pages（前端） + PartyKit（同步服务）

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

