import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { CURSOR_SCRIPT } from './cursor-script.mjs';

function cursorScript(cursor) {
  let script = CURSOR_SCRIPT;
  if (!cursor) return script;
  if (cursor.fill) script = script.replace('rgba(255, 89, 79, 0.92)', cursor.fill);
  if (cursor.down) script = script.replaceAll('#ffbd62', cursor.down);
  if (cursor.ring) script = script.replace('rgba(255, 189, 98, .95)', cursor.ring);
  return script;
}

const VIEWPORT = { width: 1920, height: 1080 };

/**
 * Drive a live URL and record the journey.
 * Capture is a CDP screencast at device pixels (default viewport 1920x1080, deviceScaleFactor 2).
 */
export async function captureJourney({ url, journey, outDir, onLog = () => {} }) {
  const viewport = journey.viewport || VIEWPORT;
  await fs.mkdir(path.join(outDir, 'raw'), { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
    args: [
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  await page.addInitScript(cursorScript(journey.cursor));
  if (typeof journey.prepare === 'function') await journey.prepare(page);

  const client = await context.newCDPSession(page);
  const frames = [];
  const writes = [];
  let seq = 0;
  client.on('Page.screencastFrame', frame => {
    const i = seq++;
    const name = `${String(i).padStart(5, '0')}.jpg`;
    const buf = Buffer.from(frame.data, 'base64');
    writes.push(fs.writeFile(path.join(outDir, 'raw', name), buf));
    frames.push({
      i,
      name,
      wall: Date.now(),
      ts: frame.metadata?.timestamp ?? null,
      w: frame.metadata?.deviceWidth ?? null,
      h: frame.metadata?.deviceHeight ?? null
    });
    client.send('Page.screencastFrameAck', { sessionId: frame.sessionId }).catch(() => {});
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 82,
    maxWidth: 3840,
    maxHeight: 2160,
    everyNthFrame: 1
  });

  const meta = {
    url,
    viewport,
    deviceScaleFactor: 2,
    steps: [],
    taps: [],
    shell: null
  };
    const ctx = createDriver(page, meta, onLog, outDir);

  try {
    onLog(`opening ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForSelector('.card, body', { timeout: 20000 }).catch(() => {});
    await page.evaluate(() => document.fonts?.ready).catch(() => {});
    if (journey.frame === 'viewport') {
      meta.shell = { x: 0, y: 0, width: viewport.width, height: viewport.height };
    } else {
      meta.shell = await page.evaluate(() => {
        const shell = document.querySelector('.frame-shell') || document.querySelector('.screen');
        if (!shell) return null;
        const r = shell.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      });
    }
    await journey.run(ctx);
  } finally {
    await client.send('Page.stopScreencast').catch(() => {});
    await Promise.all(writes);
    meta.frameCount = frames.length;
    meta.wall0 = frames[0]?.wall ?? Date.now();
    meta.wall1 = frames.at(-1)?.wall ?? meta.wall0;
    meta.captureSeconds = (meta.wall1 - meta.wall0) / 1000;
    meta.fps = meta.captureSeconds > 0 ? frames.length / meta.captureSeconds : 0;
    meta.frameSize = { w: frames.at(-1)?.w ?? null, h: frames.at(-1)?.h ?? null };
    const toVideo = wall => (wall - meta.wall0) / 1000;
    for (const step of meta.steps) {
      step.t0 = toVideo(step.wall0);
      step.t1 = toVideo(step.wall1);
      step.cues = Object.fromEntries(Object.entries(step.cueWalls).map(([k, w]) => [k, toVideo(w)]));
    }
    for (const tap of meta.taps) tap.t = toVideo(tap.wall);
    await fs.writeFile(path.join(outDir, 'capture-meta.json'), JSON.stringify({ meta, frames: frames.map(({ name, wall, w, h }) => ({ name, wall, w, h })) }, null, 2));
    await context.close();
    await browser.close();
    onLog(`capture ${frames.length} frames in ${meta.captureSeconds.toFixed(1)}s (${meta.fps.toFixed(1)} fps)`);
  }
  return meta;
}

function createDriver(page, meta, onLog, outDir) {
  let cursor = { x: 200, y: 200 };
  let current = null;

  async function pointOf(target) {
    if (target && typeof target === 'object' && 'x' in target && 'y' in target) return target;
    const locator = typeof target === 'string' ? page.locator(target).first() : target;
    await locator.waitFor({ state: 'visible', timeout: 12000 });
    const box = await locator.boundingBox();
    if (!box) throw new Error('No box for tap target');
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }

  async function glideTo(x, y) {
    const steps = 22;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const e = t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
      const nx = cursor.x + (x - cursor.x) * e;
      const ny = cursor.y + (y - cursor.y) * e;
      await page.mouse.move(nx, ny);
      if (i % 2 === 0) await page.waitForTimeout(14);
    }
    cursor = { x, y };
  }

  return {
    page,
    sleep: ms => page.waitForTimeout(ms),
    log: msg => onLog(msg),
    async step(id, fn) {
      onLog(`step ${id}`);
      current = { id, wall0: Date.now(), wall1: null, cueWalls: {}, marks: {} };
      try {
        await fn();
      } catch (err) {
        await page.screenshot({ path: path.join(outDir, `fail-${id}.png`) }).catch(() => {});
        throw new Error(`Journey step "${id}" failed: ${err.message}`);
      } finally {
        current.wall1 = Date.now();
        meta.steps.push(current);
        current = null;
      }
    },
    cue(name) {
      if (current) current.cueWalls[name] = Date.now();
    },
    async mark(name, selector) {
      if (!current) return;
      const box = await page.locator(selector).evaluateAll(els => {
        const vis = els.map(el => el.getBoundingClientRect()).filter(r => r.width > 2 && r.height > 2);
        if (!vis.length) return null;
        const x = Math.min(...vis.map(r => r.x));
        const y = Math.min(...vis.map(r => r.y));
        const r = Math.max(...vis.map(b => b.x + b.width));
        const b = Math.max(...vis.map(b => b.y + b.height));
        return { x, y, width: r - x, height: b - y };
      });
      if (box) current.marks[name] = box;
    },
    async glide(target) {
      const p = await pointOf(target);
      await glideTo(p.x, p.y);
    },
    async rest(x, y) {
      await glideTo(x, y);
    },
    async jump(x, y) {
      cursor = { x, y };
      await page.mouse.move(x, y);
    },
    async tap(target) {
      const p = await pointOf(target);
      await glideTo(p.x, p.y);
      await page.waitForTimeout(60);
      meta.taps.push({ wall: Date.now(), step: current?.id ?? null, x: p.x, y: p.y });
      await page.mouse.down();
      await page.waitForTimeout(70);
      await page.mouse.up();
      await page.waitForTimeout(80);
    },
    async wheel(dy, ms) {
      const steps = 16;
      const gap = Math.max(16, Math.round(ms / steps));
      for (let i = 0; i < steps; i++) {
        await page.mouse.wheel(0, dy / steps);
        await page.waitForTimeout(gap);
      }
    },
    async typeInto(selector, text) {
      const locator = page.locator(selector).first();
      await this.tap(locator);
      await locator.pressSequentially(text, { delay: 115 });
    }
  };
}

export async function conformCapture({ outDir, meta }) {
  const { frames } = JSON.parse(await fs.readFile(path.join(outDir, 'capture-meta.json'), 'utf8'));
  if (!frames?.length) throw new Error('No screencast frames were captured.');
  const seqDir = path.join(outDir, 'seq');
  await fs.mkdir(seqDir, { recursive: true });
  const t0 = frames[0].wall;
  const t1 = frames.at(-1).wall;
  const dur = (t1 - t0) / 1000;
  const fps = 30;
  const count = Math.max(1, Math.round(dur * fps));
  let j = 0;
  for (let i = 0; i < count; i++) {
    const wall = t0 + (i / fps) * 1000;
    while (j < frames.length - 1 && frames[j + 1].wall <= wall) j++;
    const src = path.join(outDir, 'raw', frames[j].name);
    const dest = path.join(seqDir, `${String(i).padStart(5, '0')}.jpg`);
    await fs.symlink(src, dest).catch(async () => fs.copyFile(src, dest));
  }
  const sample = frames.find(f => f.w && f.h) || frames[0];
  return { count, fps, dur, frameW: sample.w, frameH: sample.h };
}
