// Genera las pantallas de arranque de iOS (apple-touch-startup-image) para la PWA.
// iOS no usa el background_color del manifiesto: sin estas imágenes, la app muestra un
// destello blanco al abrirse desde la pantalla de inicio.
//
// Uso: CHROME=/ruta/a/chrome-headless-shell node scripts/ios-splash/generate.mjs
// Salida: public/splash/*.png y las etiquetas <link> para index.html (por stdout).
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../../public/splash');
const page = pathToFileURL(join(here, 'splash.html')).href;

// Pantallas de iPhone en vertical: [ancho CSS, alto CSS, densidad, modelos]
const DEVICES = [
  [440, 956, 3, 'iPhone 16 Pro Max'],
  [402, 874, 3, 'iPhone 16 Pro'],
  [430, 932, 3, 'iPhone 16 Plus, 15 Plus, 15 Pro Max, 14 Pro Max'],
  [393, 852, 3, 'iPhone 16, 15, 15 Pro, 14 Pro'],
  [390, 844, 3, 'iPhone 16e, 14, 13, 13 Pro, 12, 12 Pro'],
  [428, 926, 3, 'iPhone 14 Plus, 13 Pro Max, 12 Pro Max'],
  [375, 812, 3, 'iPhone 13 mini, 12 mini, 11 Pro, XS, X'],
  [414, 896, 3, 'iPhone 11 Pro Max, XS Max'],
  [414, 896, 2, 'iPhone 11, XR'],
  [414, 736, 3, 'iPhone 8 Plus, 7 Plus'],
  [375, 667, 2, 'iPhone SE (2ª/3ª gen), 8, 7'],
];

const CHROME = process.env.CHROME;
if (!CHROME) throw new Error('Define CHROME con la ruta a Chromium/Chrome headless');
const PORT = 9334;
const chrome = spawn(CHROME, ['--headless', `--remote-debugging-port=${PORT}`, '--no-sandbox', '--disable-gpu',
  '--hide-scrollbars', '--allow-file-access-from-files', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'splash-'))}`, 'about:blank'],
  { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let target;
for (let i = 0; i < 50 && !target; i++) {
  try { target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json(); }
  catch { await sleep(200); }
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0; const pending = new Map();
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((ok, ko) => { const id = ++seq; pending.set(id, (m) => m.error ? ko(new Error(m.error.message)) : ok(m.result)); ws.send(JSON.stringify({ id, method, params })); });

mkdirSync(outDir, { recursive: true });
await send('Page.enable');
const links = [];
for (const [w, h, dpr, models] of DEVICES) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile: true });
  await send('Page.navigate', { url: page });
  await sleep(700);
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  const file = `splash-${w * dpr}x${h * dpr}.png`;
  writeFileSync(join(outDir, file), Buffer.from(data, 'base64'));
  links.push(`    <!-- ${models} -->\n    <link rel="apple-touch-startup-image" href="/splash/${file}" media="(device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)" />`);
}
console.log(links.join('\n'));
ws.close(); chrome.kill(); process.exit(0);
