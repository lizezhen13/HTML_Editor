<!-- README.en.md · English -->

<div align="center">

<img src="web/assets/logo-mark.svg" width="72" alt="HTML Editor logo">

# 📝 HTML Editor · Collaborative revision for HTML

**Drop in HTML → Collaborate live → Hand off to AI**

[![English](https://img.shields.io/badge/Language-English-3b82f6?style=flat-square)](./README.en.md)
[![中文](https://img.shields.io/badge/中文-点击查看-64748b?style=flat-square)](./README.md)
[![PartyKit](https://img.shields.io/badge/Powered%20by-PartyKit-aa30ff?style=flat-square)](https://partykit.io)
[![Yjs](https://img.shields.io/badge/Sync-Yjs-ffd602?style=flat-square)](https://yjs.dev)

</div>

---

## 🌟 In one sentence

HTML Editor is a **lightweight, no-signup collaborative HTML editing tool**. Just drop an AI-generated `.html` file into the page, then edit text and comment on elements with your team in real time. When you're done, download a clean HTML file or bundle the code + comments into a prompt for your AI to keep iterating.

> Think of it as editing an online document, but the document is HTML: every change syncs live, every opinion stays attached to the page, and you can hand the full context back to AI in one click. ✨

---

## 🎬 Three steps to start

```
📤 Drop your HTML file
   ↓
🔗 Copy the share link
   ↓
✏️ Edit, comment, export
```

1. **Upload** 📤 — Drag and drop a `.html` or `.htm` file onto the landing page to instantly create a collaboration room.
2. **Share** 🔗 — Copy the URL. No registration required; anyone with the link can join.
3. **Collaborate** 🤝 — Edit text live, add element-level comments, and see who's online.

---

## ✨ Key features

| Feature | Description |
|---------|-------------|
| 🖱️ **Zero-friction upload** | Drag-and-drop to start. Supports `.html` / `.htm`, up to 2 MB per file. |
| ⚡ **Real-time multiplayer** | WebSocket + [Yjs CRDT](https://yjs.dev): simultaneous edits merge without conflicts. |
| 💬 **Element-level comments** | Click any element to leave a note; the comment list stays in sync with the page. |
| 🎨 **Visual editing** | Edit text directly in Edit mode; tweak fonts, colors, and alignment from the style toolbar. |
| 📦 **Two export modes** | Download clean HTML, or generate a Markdown prompt for AI. |
| 🐳 **Docker ready** | Run locally or self-host with a single command. |

---

## 🛠️ Tech stack

- **Frontend**: Plain HTML / CSS / JavaScript (no build step)
- **Real-time sync**: PartyKit + Yjs (CRDT)
- **Server**: PartyKit Durable Object (one per room)
- **Containerization**: Docker + Docker Compose
- **Deployment target**: Vercel / Cloudflare Pages (static frontend) + PartyKit (real-time sync server)

---

## 🚀 Quick start

### Option 1: Local Node development

```bash
# 1. Install dependencies
npm install

# 2. Start the PartyKit dev server (also serves the static web assets)
npm run dev
```

Then open `http://localhost:1214` in your browser.

```bash
# Useful scripts
npm run dev          # Local dev on port 1214
npm run build        # Build Vercel output to dist/
npm run deploy       # Deploy the PartyKit server
npm run vercel       # Deploy to Vercel
npm run preview:web  # Preview static frontend only (no WebSocket)
```

### Option 2: Docker

```bash
# Build and start the container
docker compose up -d --build

# View logs
docker compose logs -f

# Stop the service
docker compose down
```

The service runs at `http://localhost:1214` by default.

> **Mirror acceleration for China**: `docker-compose.yml` defaults to `docker.m.daocloud.io/library/node:20-slim` as the base image and uses `https://registry.npmmirror.com` as the npm registry inside the container. If you don't need a mainland-China mirror, edit the `NODE_IMAGE` argument in `docker-compose.yml` or remove/adjust `environment.npm_config_registry`.

### Option 3: Deploy to Vercel

```bash
# 1. Install Vercel CLI if you haven't
npm i -g vercel

# 2. Login and deploy
vercel
```

Or use the **Deploy with Vercel** button to import directly from your Git repository.

> **Note**: Vercel only hosts the static frontend. The real-time collaboration service still needs to be deployed to PartyKit.
>
> 1. Deploy the PartyKit service:
>    ```bash
>    npx partykit deploy
>    ```
> 2. Set the `PARTYKIT_HOST` environment variable in the Vercel dashboard (or during project linking), e.g. `html-editor-demo.your-username.partykit.dev`.
> 3. `scripts/build-vercel.js` injects `PARTYKIT_HOST` into `PARTYKIT_PROD` in `web/src/collab.js` at build time. If unset, the frontend falls back to the current page host.
>
> `vercel.json` is already configured with routes: `/room.html` is served directly, and all other paths fall back to `index.html`.

---

## ⚙️ Environment variables

| Variable | Description | Default | Use case |
|----------|-------------|---------|----------|
| `PARTYKIT_HOST` | PartyKit production host, e.g. `html-editor-demo.your-username.partykit.dev` | Empty string (falls back to current page host) | Vercel / custom static hosting |
| `npm_config_registry` | npm registry URL | `https://registry.npmmirror.com` | Docker build |

> You usually don't need to set `PARTYKIT_HOST` for local development: `collab.js` treats `localhost`, `127.0.0.1`, private IPs, and `.partykit.dev` as same-origin.

---

## 🏗️ Project structure

```
HTML_Editor/
├── web/                  # Frontend static assets
│   ├── index.html        # Landing page (upload entry)
│   ├── room.html         # Collaboration room
│   ├── src/              # Frontend business scripts
│   ├── styles/           # Stylesheets
│   ├── assets/           # Icons and logo
│   └── vendor/           # Self-hosted third-party libs (Yjs / y-partykit)
├── party/
│   └── server.ts         # PartyKit server
├── docs/                 # Design docs and architecture notes
│   ├── architecture.md   # System architecture
│   ├── design-system.md  # Design system
│   └── roadmap.md        # Roadmap
├── package.json
├── partykit.json
├── vercel.json              # Vercel deployment config
├── scripts/
│   └── build-vercel.js      # Vercel build script
├── .vercelignore            # Vercel ignore rules
├── Dockerfile
└── docker-compose.yml
```

---

## 🧠 Architecture at a glance

```
┌────────────┐      WebSocket      ┌──────────────────┐
│  Browser A │ ◄─────────────────► │  PartyKit Room   │
└────────────┘                     │ (Durable Object) │
                                   └────────┬─────────┘
┌────────────┐      WebSocket            │
│  Browser B │ ◄────────────────────────────┘
└────────────┘
```

- Each room maps to a **PartyKit Durable Object**, which keeps the long-lived connection state.
- Document state is synchronized via **Yjs CRDT**; changes are merged automatically after reconnections.
- HTML is split into a **skeleton** (immutable structure) and **editable blocks** (CRDT-synced text), preserving the original layout while enabling fine-grained collaboration.

For details, see [`docs/architecture.md`](./docs/architecture.md).

---

## 🗺️ Roadmap

- [x] Landing page drag-and-drop upload and visual prototype
- [x] Collaboration room UI: editor, comments sidebar, status strip
- [x] Real-time text and comment sync
- [x] User identity (nickname + color)
- [x] Export clean HTML / Export AI prompt
- [ ] Persist snapshots to R2 / KV
- [ ] Mobile read-only view
- [ ] Room metadata page
- [ ] Public deploy and abuse protection

See the full roadmap at [`docs/roadmap.md`](./docs/roadmap.md).

---

## 📝 Tips

- **Switch language**: Click the globe icon 🌐 in the top-right corner of the landing page to switch between **English / 中文**. English is the fallback if your system language is not Chinese.
- **Switch mode**: Use the segmented control in the room top bar to toggle between **Edit** and **Comment** modes.
- **Keyboard shortcut**: In the comment composer, press `⌘ + Enter` (Mac) or `Ctrl + Enter` (Windows) to save quickly.
- **Hand off to AI**: Click **Export ▾ → Hand off to AI** to copy code and comments together into a prompt for your LLM.
