// Vercel 构建脚本：把 web/ 静态资源复制到 dist/，并注入生产环境 PartyKit 主机地址。

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'web');
const OUT_DIR = path.join(ROOT, 'dist');

// 递归复制目录
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 确保输出目录存在。Vercel 使用干净工作区，本地重复构建时直接覆盖同名文件。
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}
copyDir(SRC_DIR, OUT_DIR);

const DEFAULT_PARTYKIT_HOST = 'party.lizezhen13.ccwu.cc';

function normalizeHost(host) {
  const value = (host || '').trim();
  if (!value) return '';

  try {
    if (/^[a-z]+:\/\//i.test(value)) {
      return new URL(value).host;
    }
  } catch {
    // Fall through to string cleanup for partially typed host values.
  }

  return value
    .replace(/^(https?|wss?):\/\//i, '')
    .replace(/\/+$/, '');
}

// 写入前端脚本。Vercel 未设置环境变量时，默认连接自定义 PartyKit 域名。
const partykitHost = normalizeHost(process.env.PARTYKIT_HOST || DEFAULT_PARTYKIT_HOST);
if (partykitHost) {
  const collabPath = path.join(OUT_DIR, 'src', 'collab.js');
  if (fs.existsSync(collabPath)) {
    const escaped = partykitHost.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    let content = fs.readFileSync(collabPath, 'utf8');
    content = content.replace(
      /const PARTYKIT_PROD\s*=\s*['"][^'"]*['"];/,
      `const PARTYKIT_PROD = '${escaped}';`
    );
    fs.writeFileSync(collabPath, content, 'utf8');
    console.log(`[build-vercel] 已注入 PARTYKIT_HOST: ${partykitHost}`);
  }
} else {
  console.log('[build-vercel] 未设置 PARTYKIT_HOST，前端将回退到当前页面 host。');
}

console.log('[build-vercel] 构建完成，输出目录: dist/');
