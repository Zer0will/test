import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ffprobe, ffmpeg } from './clips.mjs';

const FONT = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf';

/**
 * The device interior of a real screen is not a flat field.
 * A missing still renders as a large near-uniform grey or blank panel.
 */
export function deviceUniformity(buf, width, height, rect, offset = 0) {
  const x0 = Math.max(0, Math.round(rect.x + 16));
  const y0 = Math.max(0, Math.round(rect.y + 16));
  const x1 = Math.min(width, Math.round(rect.x + rect.w - 16));
  const y1 = Math.min(height, Math.round(rect.y + rect.h - 16));
  let n = 0;
  let sum = 0;
  let sum2 = 0;
  for (let y = y0; y < y1; y += 3) {
    for (let x = x0; x < x1; x += 3) {
      const i = offset + (y * width + x) * 3;
      const yv = 0.2126 * buf[i] + 0.7152 * buf[i + 1] + 0.0722 * buf[i + 2];
      sum += yv;
      sum2 += yv * yv;
      n++;
    }
  }
  if (!n) return { mean: 0, stdev: 0, blank: true };
  const mean = sum / n;
  const stdev = Math.sqrt(Math.max(0, sum2 / n - mean * mean));
  return { mean, stdev, blank: stdev < 8 };
}

export async function reviewVideo(file, { workDir, width, height, background = '#0d0c0f', durationMin = 20, durationMax = 30.5, device = null }) {
  const probe = await ffprobe(file);
  const video = (probe.streams || []).find(s => s.codec_type === 'video');
  const audio = (probe.streams || []).find(s => s.codec_type === 'audio');
  const duration = Number(probe.format?.duration || 0);
  const [num, den] = String(video?.avg_frame_rate || '0/1').split('/').map(Number);
  const fps = den ? num / den : 0;
  const stat = await fs.stat(file);
  const issues = [];
  if (video?.width !== width || video?.height !== height) issues.push({ type: 'size', detail: `${video?.width}x${video?.height}` });
  if (Math.abs(fps - 30) > 0.2) issues.push({ type: 'fps', detail: fps.toFixed(2) });
  if (duration < durationMin || duration > durationMax) issues.push({ type: 'duration', detail: duration.toFixed(2) });
  if (!audio) issues.push({ type: 'audio', detail: 'missing soundtrack' });
  if (stat.size > 15 * 1024 * 1024) issues.push({ type: 'filesize', detail: `${(stat.size / 1024 / 1024).toFixed(1)} MB` });

  const bg = hexToRgb(background);
  const pixels = await readFrames(file, width, height, bg, device);
  const blank = [];
  const edges = [];
  const deviceBlank = [];
  pixels.forEach((frame, i) => {
    if (frame.stdev < 7 && frame.mean < 22) blank.push({ t: i, mean: frame.mean, stdev: frame.stdev });
    if (frame.inkRatio > 0.02) edges.push({ t: i, inkRatio: Number(frame.inkRatio.toFixed(4)) });
    if (frame.device?.blank) deviceBlank.push({ t: i, mean: Number(frame.device.mean.toFixed(1)), stdev: Number(frame.device.stdev.toFixed(2)) });
  });
  if (blank.length) issues.push({ type: 'blank', frames: blank });
  if (edges.length) issues.push({ type: 'edge', frames: edges });
  if (deviceBlank.length) issues.push({ type: 'device-blank', frames: deviceBlank });

  const sheet = await contactSheet(file, workDir, pixels.length, background);
  return {
    ok: issues.length === 0,
    issues,
    duration,
    fps,
    width: video?.width,
    height: video?.height,
    bytes: stat.size,
    contactSheet: sheet
  };
}

function hexToRgb(hex) {
  const h = String(hex || '#0d0c0f').replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

async function readFrames(file, width, height, bg, device) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', [
      '-hide_banner', '-v', 'error', '-i', file,
      '-vf', 'fps=1,format=rgb24', '-f', 'rawvideo', '-'
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
    const chunks = [];
    let err = '';
    proc.stdout.on('data', d => chunks.push(d));
    proc.stderr.on('data', d => { err += d; });
    proc.on('close', code => {
      if (code !== 0) return reject(new Error(err.slice(-800)));
      const buf = Buffer.concat(chunks);
      const frameBytes = width * height * 3;
      const frames = [];
      for (let off = 0; off + frameBytes <= buf.length; off += frameBytes) {
        const frame = stats(buf, off, width, height, bg);
        if (device) frame.device = deviceUniformity(buf, width, height, device, off);
        frames.push(frame);
      }
      resolve(frames);
    });
  });
}

function stats(buf, off, w, h, bg) {
  let n = 0;
  let sum = 0;
  let sum2 = 0;
  let border = 0;
  let ink = 0;
  for (let y = 0; y < h; y++) {
    const edgeY = y < 4 || y >= h - 4;
    for (let x = 0; x < w; x++) {
      const i = off + (y * w + x) * 3;
      const r = buf[i];
      const g = buf[i + 1];
      const b = buf[i + 2];
      const yv = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      sum += yv;
      sum2 += yv * yv;
      n++;
      if (edgeY || x < 4 || x >= w - 4) {
        border++;
        const d = Math.max(Math.abs(r - bg[0]), Math.abs(g - bg[1]), Math.abs(b - bg[2]));
        if (d > 24) ink++;
      }
    }
  }
  const mean = sum / n;
  const variance = Math.max(0, sum2 / n - mean * mean);
  return { mean, stdev: Math.sqrt(variance), inkRatio: border ? ink / border : 0 };
}

async function contactSheet(file, workDir, count, background = '#0d0c0f') {
  const dir = path.join(workDir, 'contact-frames');
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
  await ffmpeg([
    '-i', file,
    '-vf', `fps=1,scale=300:-2,drawtext=fontfile=${FONT}:text='%{pts\\:hms}':x=8:y=8:fontsize=16:fontcolor=white:box=1:boxcolor=0x00000088`,
    path.join(dir, 'f%03d.png')
  ]);
  const names = (await fs.readdir(dir)).filter(n => n.startsWith('f')).sort();
  const cols = 6;
  const rows = Math.max(1, Math.ceil(names.length / cols));
  const seq = path.join(workDir, 'contact-seq');
  await fs.rm(seq, { recursive: true, force: true });
  await fs.mkdir(seq, { recursive: true });
  for (let i = 0; i < cols * rows; i++) {
    const src = names[Math.min(i, names.length - 1)];
    await fs.copyFile(path.join(dir, src), path.join(seq, `${String(i).padStart(3, '0')}.png`));
  }
  const sheet = path.join(workDir, 'contact-sheet.png');
  await ffmpeg([
    '-framerate', '1', '-i', path.join(seq, '%03d.png'),
    '-vf', `tile=${cols}x${rows}:padding=10:margin=10:color=0x${String(background).replace('#', '')}`,
    '-frames:v', '1',
    sheet
  ]);
  void count;
  return sheet;
}
