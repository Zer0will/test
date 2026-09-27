import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';
import { ffmpeg } from './clips.mjs';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.wav': 'audio/wav',
  '.ttf': 'font/ttf',
  '.json': 'application/json'
};

export function serve(root) {
  const server = http.createServer(async (req, res) => {
    try {
      const url = decodeURIComponent((req.url || '/').split('?')[0]);
      const file = path.resolve(root, '.' + url);
      if (!file.startsWith(path.resolve(root))) {
        res.statusCode = 403;
        res.end();
        return;
      }
      const data = await fs.readFile(file);
      res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
      res.end(data);
    } catch {
      res.statusCode = 404;
      res.end('missing');
    }
  });
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

export async function openComposition(server, layout) {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
    args: ['--disable-dev-shm-usage', '--hide-scrollbars', '--font-render-hinting=none']
  });
  const page = await browser.newPage({
    viewport: { width: layout.width, height: layout.height },
    deviceScaleFactor: 1
  });
  const port = server.address().port;
  await page.goto(`http://127.0.0.1:${port}/composition/index.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__ready === true || window.__error, null, { timeout: 20000 });
  const error = await page.evaluate(() => window.__error || '');
  if (error) throw new Error(`Composition failed: ${error}`);
  return {
    page,
    async close() { await browser.close(); }
  };
}

export async function sampleBoxes(page, times) {
  const samples = [];
  for (const t of times) {
    await page.evaluate(async t => { await window.__seek(t); }, t);
    const boxes = await page.evaluate(() => window.__measure());
    samples.push({ t, boxes });
  }
  return samples;
}

export async function renderFrames(page, outDir, frameCount, onLog = () => {}) {
  const dir = path.join(outDir, 'render');
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
  for (let i = 0; i < frameCount; i++) {
    const t = i / 30;
    await page.evaluate(async t => { await window.__seek(t); }, t);
    await page.screenshot({
      path: path.join(dir, `${String(i).padStart(4, '0')}.jpg`),
      type: 'jpeg',
      quality: 90,
      animations: 'disabled'
    });
    if (i % 30 === 0) onLog(`frame ${i}/${frameCount}`);
  }
  onLog(`frame ${frameCount}/${frameCount}`);
}

export async function encode(outDir, { high = true } = {}) {
  const frames = path.join(outDir, 'render', '%04d.jpg');
  const audio = path.join(outDir, 'soundtrack.wav');
  const web = path.join(outDir, 'brag.mp4');
  await ffmpeg([
    '-framerate', '30', '-i', frames, '-i', audio,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '21', '-preset', 'medium',
    '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart',
    web
  ]);
  if (high) {
    await ffmpeg([
      '-framerate', '30', '-i', frames, '-i', audio,
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', '-preset', 'medium',
      '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart',
      path.join(outDir, 'brag-high.mp4')
    ]);
  }
  return web;
}
