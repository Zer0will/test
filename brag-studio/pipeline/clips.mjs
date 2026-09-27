import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

export function ffmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', ['-hide_banner', '-y', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    proc.stderr.on('data', d => { err += d.toString(); });
    proc.on('close', code => (code === 0 ? resolve(err) : reject(new Error(err.slice(-2500)))));
  });
}

export function ffprobe(file) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=width,height,avg_frame_rate,codec_type', '-of', 'json', file], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    proc.stdout.on('data', d => { out += d; });
    proc.stderr.on('data', d => { err += d; });
    proc.on('close', code => (code === 0 ? resolve(JSON.parse(out)) : reject(new Error(err))));
  });
}

export function jpegSize(buf) {
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker === 0xd8 || marker === 0xd9) { i += 2; continue; }
    const len = buf.readUInt16BE(i + 2);
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  throw new Error('Could not read JPEG size');
}

function evenBox(x, y, w, h, maxW, maxH) {
  let X = Math.max(0, Math.floor(x));
  let Y = Math.max(0, Math.floor(y));
  let W = Math.floor(w);
  let H = Math.floor(h);
  if (X % 2) X -= 1;
  if (Y % 2) Y -= 1;
  if (W % 2) W -= 1;
  if (H % 2) H -= 1;
  if (X + W > maxW) W = maxW - X - ((maxW - X) % 2);
  if (Y + H > maxH) H = maxH - Y - ((maxH - Y) % 2);
  if (W < 2 || H < 2) throw new Error('Crop is empty');
  return { x: X, y: Y, w: W, h: H };
}

function nearest(frames, wall) {
  let lo = 0;
  let hi = frames.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (frames[mid].wall < wall) lo = mid + 1;
    else hi = mid;
  }
  const b = frames[lo];
  const a = frames[Math.max(0, lo - 1)];
  return Math.abs(a.wall - wall) <= Math.abs(b.wall - wall) ? a : b;
}

export async function buildClips({ outDir, scenes, shell }) {
  const saved = JSON.parse(await fs.readFile(path.join(outDir, 'capture-meta.json'), 'utf8'));
  const frames = saved.frames;
  const first = await fs.readFile(path.join(outDir, 'raw', frames[0].name));
  const jpeg = jpegSize(first);
  const viewW = saved.meta.viewport?.width || 1920;
  const scale = jpeg.w / viewW;
  const crop = shell
    ? evenBox(shell.x * scale, shell.y * scale, shell.width * scale, shell.height * scale, jpeg.w, jpeg.h)
    : evenBox((1920 - 390) / 2 * scale, (1080 - 844) / 2 * scale, 390 * scale, 844 * scale, jpeg.w, jpeg.h);

  const clipsRoot = path.join(outDir, 'clips');
  await fs.rm(clipsRoot, { recursive: true, force: true });
  await fs.mkdir(clipsRoot, { recursive: true });

  for (const scene of scenes) {
    const dir = path.join(clipsRoot, scene.id);
    const srcDir = path.join(clipsRoot, `${scene.id}-src`);
    await fs.mkdir(dir, { recursive: true });
    await fs.mkdir(srcDir, { recursive: true });
    const n = scene.hold ? 1 : Math.max(1, Math.round(scene.duration * 30));
    scene.frames = n;
    for (let k = 0; k < n; k++) {
      const srcT = scene.hold ? scene.holdAt : scene.srcIn + (k / 30) * scene.rate;
      const wall = saved.meta.wall0 + srcT * 1000;
      const frame = nearest(frames, wall);
      const dest = path.join(srcDir, `${String(k).padStart(4, '0')}.jpg`);
      await fs.symlink(path.join(outDir, 'raw', frame.name), dest).catch(() => fs.copyFile(path.join(outDir, 'raw', frame.name), dest));
    }
    await ffmpeg([
      '-framerate', '30',
      '-i', path.join(srcDir, '%04d.jpg'),
      '-vf', `crop=${crop.w}:${crop.h}:${crop.x}:${crop.y}`,
      '-q:v', '2',
      '-start_number', '0',
      path.join(dir, '%04d.jpg')
    ]);
    await fs.rm(srcDir, { recursive: true, force: true });
  }
  return { jpeg, crop, scale };
}
