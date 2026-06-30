const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, '.wrangler-partykit');
const ENTRY_FILE = path.join(OUT_DIR, 'entry.js');
const OUT_FILE = path.join(OUT_DIR, 'worker.js');
const PROCESS_SHIM_FILE = path.join(OUT_DIR, 'process-shim.js');

const PARTYKIT_HOST = 'party.lizezhen13.ccwu.cc';
const PARTYKIT_API_BASE = 'https://api.partykit.dev';

const facadePath = path.join(ROOT, 'node_modules', 'partykit', 'dist', 'generated.js');
const workerPath = path.join(ROOT, 'party', 'server.ts').replace(/\\/g, '/');

const emptyStaticAssetsManifest = {
  devServer: '',
  browserTTL: null,
  edgeTTL: null,
  singlePageApp: false,
  assets: {},
  assetInfo: {},
};

if (!fs.existsSync(facadePath)) {
  throw new Error(`Could not find PartyKit generated facade: ${facadePath}`);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const facade = fs.readFileSync(facadePath, 'utf8')
  .replace('__WORKER__', workerPath)
  .replace('__R2_BINDINGS__', JSON.stringify([]))
  .replace('__KV_BINDINGS__', JSON.stringify([]))
  .replace('__PARTIES__', '');

fs.writeFileSync(ENTRY_FILE, facade, 'utf8');
fs.writeFileSync(PROCESS_SHIM_FILE, 'const process = { env: {} };\nexport { process };\nexport default process;\n', 'utf8');

async function main() {
  await esbuild.build({
    entryPoints: [ENTRY_FILE],
    outfile: OUT_FILE,
    bundle: true,
    format: 'esm',
    target: 'esnext',
    conditions: ['partykit', 'workerd', 'worker'],
    sourcemap: true,
    inject: [PROCESS_SHIM_FILE],
    define: {
      PARTYKIT_HOST: JSON.stringify(PARTYKIT_HOST),
      PARTYKIT_API_BASE: JSON.stringify(PARTYKIT_API_BASE),
    },
    plugins: [
      {
        name: 'partykit-static-assets-manifest',
        setup(build) {
          build.onResolve({ filter: /^__STATIC_ASSETS_MANIFEST__$/ }, () => ({
            path: '__STATIC_ASSETS_MANIFEST__',
            namespace: 'partykit',
          }));
          build.onLoad({ filter: /^__STATIC_ASSETS_MANIFEST__$/, namespace: 'partykit' }, () => ({
            contents: `export default ${JSON.stringify(emptyStaticAssetsManifest)};`,
            loader: 'js',
          }));
        },
      },
    ],
  });

  console.log(`[build-cloudflare-worker] Built ${path.relative(ROOT, OUT_FILE)} for ${PARTYKIT_HOST}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
