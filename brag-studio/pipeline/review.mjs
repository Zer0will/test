import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ffprobe, ffmpeg } from './clips.mjs';

const FONT = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf';

export async function reviewVideo(file, { workDir, width, height }) {
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
  if (duration < 20 || duration > 30.5) issues.push({ type: 'duration', detail: duration.toFixed(2) });
  if (!audio) issues.push({ type: 'audio', detail: 'missing soundtrack' });
  if (stat.size > 15 * 1024 * 1024) issues.push({ type: 'filesize', detail: `${(stat.size / 1024 / 1024).toFixed(1)} MB` });

  const pixels = await readFrames(file, width, height);
  const blank = [];
  const edges = [];
  pixels.forEach((frame, i) => {
    if (frame.stdev < 7 && frame.mean < 22) blank.push({ t: i, mean: frame.mean, stdev: frame.stdev });
    if (frame.inkRatio > 0.02) edges.push({ t: i, inkRatio: Number(frame.inkRatio.toFixed(4)) });
  });
  if (blank.length) issues.push({ type: 'blank', frames: blank });
  if (edges.length) issues.push({ type: 'edge', frames: edges });

  const sheet = await contactSheet(file, workDir, pixels.length);
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

async function readFrames(file, width, height) {
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
        frames.push(stats(buf, off, width, height));
      }
      resolve(frames);
    });
  });
}

function stats(buf, off, w, h) {
  let n = 0;
  let sum = 0;
  let sum2 = 0;
  let border = 0;
  let ink = 0;
  const bg = [8, 9, 13];
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

async function contactSheet(file, workDir, count) {
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
    '-vf', `tile=${cols}x${rows}:padding=10:margin=10:color=0x08090d`,
    '-frames:v', '1',
    sheet
  ]);
  void count;
  return sheet;
}
