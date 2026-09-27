import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function writeComposition(outDir, data) {
  const dir = path.join(outDir, 'composition');
  await fs.mkdir(dir, { recursive: true });
  const fontDir = path.join(outDir, 'fonts');
  await fs.mkdir(fontDir, { recursive: true });
  const srcFonts = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fonts');
  for (const name of await fs.readdir(srcFonts)) {
    await fs.copyFile(path.join(srcFonts, name), path.join(fontDir, name)).catch(() => {});
  }
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  await fs.writeFile(path.join(dir, 'index.html'), html(json));
}

function html(json) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>brag-studio</title>
<style>
  @font-face { font-family: "Black Han Sans"; src: url("/fonts/BlackHanSans.ttf") format("truetype"); font-weight: 400; }
  @font-face { font-family: "Nanum Pen Script"; src: url("/fonts/NanumPenScript.ttf") format("truetype"); font-weight: 400; }
  @font-face { font-family: "Schibsted Grotesk"; src: url("/fonts/SchibstedGrotesk-500.ttf") format("truetype"); font-weight: 500; }
  @font-face { font-family: "Schibsted Grotesk"; src: url("/fonts/SchibstedGrotesk-700.ttf") format("truetype"); font-weight: 700; }
  @font-face { font-family: "Schibsted Grotesk"; src: url("/fonts/SchibstedGrotesk-800.ttf") format("truetype"); font-weight: 800; }
  :root {
    --s: 1; --m: 72px; --copy-top: 116px; --text-w: 640px;
    --hook: 92px; --title: 58px; --end: 104px; --sub: 24px;
    --phone-x: 0px; --phone-y: 0px; --phone-w: 400px; --phone-h: 860px; --radius: 48px;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; overflow: hidden; background: #08090d; color: #f6eede; font-family: "Schibsted Grotesk", sans-serif; }
  body { position: relative; }
  .glow { position: absolute; left: 160px; top: 140px; width: 480px; height: 380px; background: radial-gradient(circle, rgba(255,89,79,.18), transparent 70%); filter: blur(6px); pointer-events: none; }
  .copy { position: absolute; left: var(--m); top: var(--copy-top); width: var(--text-w); }
  .pen { font-family: "Nanum Pen Script", cursive; font-size: calc(42px * var(--s)); color: #ffbd62; line-height: 1; margin: 0 0 6px; }
  .kicker { font-weight: 700; letter-spacing: .22em; font-size: calc(13px * var(--s)); color: #ffbd62; text-transform: uppercase; margin: 0 0 14px; }
  .rule { width: 46px; height: 3px; border-radius: 2px; background: #ff594f; margin: 0 0 18px; }
  .word, .title, .end-title { font-family: "Black Han Sans", sans-serif; font-weight: 400; margin: 0; }
  .word { font-size: calc(var(--hook) * var(--s)); line-height: 1.04; }
  .word.a { color: #f6eede; } .word.b { color: #ffbd62; } .word.c { color: #ff594f; }
  .title { font-size: calc(var(--title) * var(--s)); line-height: 1.08; margin: 0 0 14px; }
  .end-title { font-size: calc(var(--end) * var(--s)); line-height: 1; margin: 0 0 16px; }
  .sub { font-weight: 500; font-size: calc(var(--sub) * var(--s)); line-height: 1.35; color: #f3eadc; margin: 0; max-width: 36rem; }
  .callout { display: inline-block; margin-top: 22px; padding: 10px 16px; border-radius: 999px; border: 1px solid rgba(255,189,98,.6); color: #ffbd62; font-weight: 700; font-size: calc(16px * var(--s)); }
  .disclaimer { position: absolute; left: var(--m); bottom: var(--m); color: #ffbd62; font-weight: 700; font-size: 15px; letter-spacing: .03em; }
  .disclaimer i { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ff594f; margin-right: 8px; vertical-align: 1px; }
  .phone-shadow { position: absolute; left: var(--phone-x); top: var(--phone-y); width: var(--phone-w); height: var(--phone-h); filter: drop-shadow(0 22px 36px rgba(0,0,0,.55)); }
  .phone-clip { width: 100%; height: 100%; border-radius: var(--radius); overflow: hidden; background: #08090d; }
  #stage { width: 100%; height: 100%; position: relative; }
  #shot { width: 100%; height: 100%; display: block; }
  #dim { position: absolute; inset: 0; background: #000; pointer-events: none; }
  #hl { position: absolute; border: 3px solid #ffbd62; border-radius: 18px; box-shadow: 0 0 0 1px rgba(0,0,0,.4), 0 0 22px rgba(255,189,98,.28); pointer-events: none; }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="copy" id="hook">
    <div class="pen" data-id="pen"></div>
    <div class="kicker" data-id="kicker"></div>
    <div class="rule" data-id="rule"></div>
    <div class="word a" data-id="w0"></div>
    <div class="word b" data-id="w1"></div>
    <div class="word c" data-id="w2"></div>
    <p class="sub" data-id="sub"></p>
  </div>
  <div class="copy" id="feature">
    <div class="kicker" data-id="kicker"></div>
    <div class="rule" data-id="rule"></div>
    <h1 class="title" data-id="title"></h1>
    <p class="sub" data-id="sub"></p>
    <div class="callout" data-id="callout"></div>
  </div>
  <div class="copy" id="end">
    <div class="kicker" data-id="kicker"></div>
    <h1 class="end-title" data-id="title"></h1>
    <p class="sub" data-id="sub"></p>
  </div>
  <div class="disclaimer" data-id="disclaimer"><i></i><span></span></div>
  <div class="phone-shadow"><div class="phone-clip"><div id="stage"><canvas id="shot"></canvas><div id="dim"></div><div id="hl"></div></div></div></div>
<script>
const DATA = ${json};
const root = document.documentElement;
const body = document.body;
const L = DATA.layout;
body.style.width = L.width + 'px';
body.style.height = L.height + 'px';
root.style.setProperty('--s', String(L.fontScale));
root.style.setProperty('--m', L.margin + 'px');
root.style.setProperty('--copy-top', (L.textTop || 116) + 'px');
root.style.setProperty('--text-w', L.textWidth + 'px');
root.style.setProperty('--hook', L.hookSize + 'px');
root.style.setProperty('--title', L.titleSize + 'px');
root.style.setProperty('--end', L.endSize + 'px');
root.style.setProperty('--sub', L.subSize + 'px');
root.style.setProperty('--phone-x', L.phone.x + 'px');
root.style.setProperty('--phone-y', L.phone.y + 'px');
root.style.setProperty('--phone-w', L.phone.w + 'px');
root.style.setProperty('--phone-h', L.phone.h + 'px');
root.style.setProperty('--radius', Math.round(46 / 844 * L.phone.h) + 'px');
document.querySelector('.disclaimer span').textContent = DATA.disclaimer;
document.getElementById('end').style.top = (L.endTop || L.textTop || 240) + 'px';

const groups = {
  hook: document.getElementById('hook'),
  feature: document.getElementById('feature'),
  end: document.getElementById('end')
};
const cache = new Map();
function load(src) {
  if (!cache.has(src)) {
    cache.set(src, new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error(src));
      im.src = src;
    }));
  }
  return cache.get(src);
}
function ease(t) { t = Math.max(0, Math.min(1, t)); return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2; }
function fade(t, a, b, f) {
  if (t < a || t >= b) return 0;
  return Math.min(1, (t - a) / f, (b - t) / f);
}
function sceneAt(t) {
  return DATA.scenes.find(s => t >= s.start && t < s.end) || DATA.scenes[DATA.scenes.length - 1];
}
const canvas = document.getElementById('shot');
const ctx = canvas.getContext('2d', { alpha: false });
const stage = document.getElementById('stage');
const dim = document.getElementById('dim');
const hl = document.getElementById('hl');

function applyCopy(scene, t) {
  for (const [kind, node] of Object.entries(groups)) {
    const on = (kind === 'feature' ? scene.kind === 'feature' : scene.kind === kind);
    node.style.display = on ? 'block' : 'none';
    if (!on) continue;
    for (const el of node.querySelectorAll('[data-id]')) {
      const key = el.dataset.id;
      let text = '';
      if (key[0] === 'w') text = (scene.copy.words || [])[Number(key.slice(1))] || '';
      else if (key === 'rule') text = ' ';
      else text = scene.copy[key] || '';
      if (key !== 'rule') el.textContent = text;
      const spec = DATA.windows[scene.id + ':' + key];
      const inn = spec ? spec.in : scene.start + (key === 'rule' ? 0.08 : 0.1);
      const out = spec ? spec.out : scene.end;
      const o = (text || key === 'rule') ? fade(t, inn, out + 0.02, 0.22) : 0;
      el.style.opacity = o;
      el.style.transform = 'translateY(' + ((1 - Math.min(1, Math.max(0, (t - inn) / 0.22))) * 14) + 'px)';
      el.dataset.measure = scene.id + ':' + key;
    }
  }
}

window.__seek = async (t) => {
  const scene = sceneAt(t);
  const local = Math.max(0, t - scene.start);
  const idx = scene.frames <= 1 ? 0 : Math.min(scene.frames - 1, Math.max(0, Math.round(local * 30)));
  const src = '/clips/' + scene.id + '/' + String(idx).padStart(4, '0') + '.jpg';
  const im = await load(src);
  if (canvas.width !== im.naturalWidth) { canvas.width = im.naturalWidth; canvas.height = im.naturalHeight; }
  ctx.drawImage(im, 0, 0);
  const u = ease(Math.min(1, local / 0.8));
  const z = scene.zoomFrom + (scene.zoomTo - scene.zoomFrom) * u;
  stage.style.transformOrigin = scene.originX + '% ' + scene.originY + '%';
  stage.style.transform = 'scale(' + z + ')';
  dim.style.opacity = String(scene.dim || 0);
  if (scene.highlight) {
    const h = scene.highlight;
    const o = fade(local, h.in, h.out, 0.2);
    hl.style.opacity = String(o);
    hl.style.left = (h.x * 100) + '%';
    hl.style.top = (h.y * 100) + '%';
    hl.style.width = (h.w * 100) + '%';
    hl.style.height = (h.h * 100) + '%';
  } else hl.style.opacity = '0';
  applyCopy(scene, t);
  const disc = document.querySelector('.disclaimer');
  const discIn = 0.12;
  disc.style.opacity = String(fade(t, discIn, DATA.duration + 2, 0.3));
  disc.dataset.measure = 'disclaimer';
};

window.__measure = () => {
  const boxes = [];
  for (const el of document.querySelectorAll('[data-measure]')) {
    const o = Number(getComputedStyle(el).opacity);
    if (!el.textContent.trim()) continue;
    const r = el.getBoundingClientRect();
    boxes.push({ id: el.dataset.measure, x: r.x, y: r.y, w: r.width, h: r.height, opacity: o });
  }
  return boxes;
};

window.__ready = false;
(async () => {
  try {
    await document.fonts.ready;
    await window.__seek(0.2);
    window.__ready = true;
  } catch (err) {
    window.__error = String(err && err.stack || err);
  }
})();
</script>
</body>
</html>`;
}
