# ─────────────────────────────────────────────────────────────
#  Dockerfile for HTML_Editor
#  默认使用 node:20-slim，兼容 Cloudflare workerd 原生二进制
#  构建时通过 ARG 可替换为国内镜像
#  例：docker build --build-arg NODE_IMAGE=registry.cn-hangzhou.aliyuncs.com/acs/node:20-slim .
# ─────────────────────────────────────────────────────────────

ARG NODE_IMAGE=node:20-slim
FROM ${NODE_IMAGE}

# 设置工作目录
WORKDIR /app

# 先复制包管理文件，可利用 Docker 缓存层
COPY package.json package-lock.json ./
COPY partykit.json ./

# 国内用户：使用淘宝/阿里 npm 镜像，加快依赖下载
# 如需使用其他镜像，请修改下一行或在外层通过 .npmrc 注入
RUN npm config set registry https://registry.npmmirror.com \
    && npm config set fetch-retries 3 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000

# 安装依赖（CI 模式，保证可复现；partykit 在 devDependencies 中，运行时需要）
RUN npm ci --no-audit --no-fund

# 复制项目代码
COPY web/ ./web/
COPY party/ ./party/

# 暴露 PartyKit 开发服务器端口（与 package.json 中的 --port 1214 保持一致）
EXPOSE 1214

# 启动服务（同时托管 web 静态资源和 PartyKit WebSocket）
CMD ["npm", "start"]
