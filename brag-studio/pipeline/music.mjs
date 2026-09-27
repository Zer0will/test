import fs from 'node:fs/promises';
import path from 'node:path';
import { ffmpeg } from './clips.mjs';

const SR = 44100;

function clamp16(v) {
  const n = Math.round(v * 32767);
  return Math.max(-32767, Math.min(32767, n));
}

/** Warm, sparse bed written as stereo PCM. Original, no sample library. */
export function renderBed(duration) {
  const n = Math.ceil(duration * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const bpm = 92;
  const beat = 60 / bpm;
  const D2 = 73.42;
  const roots = [D2, D2, 110, 98, D2, 92.5, 98, 110];
  const pent = [293.66, 329.63, 369.99, 440, 493.88, 587.33];
  const melody = [2, 4, 2, 0, 3, 1, 4, 2, 0, 2, 4, 3, 1, 0, 2, 4];

  let noise = 1;
  const rnd = () => {
    noise = (noise * 16807) % 2147483647;
    return (noise / 2147483647) * 2 - 1;
  };
  let hat = 0;

  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const fadeIn = Math.min(1, t / 0.6);
    const fadeOut = Math.min(1, Math.max(0, (duration - t) / 1.4));
    const env = fadeIn * fadeOut;

    const beatIdx = Math.floor(t / beat);
    const into = t - beatIdx * beat;
    const root = roots[beatIdx % roots.length];
    const bassEnv = Math.exp(-into * 3.2) * (into < beat * 0.92 ? 1 : 0);
    const bass = Math.sin(2 * Math.PI * root * t) * 0.16 * bassEnv
      + Math.sin(2 * Math.PI * root * 2 * t) * 0.03 * bassEnv;

    const chord = [1, 1.25, 1.5].map(m => Math.sin(2 * Math.PI * root * 2 * m * t)).reduce((a, b) => a + b, 0);
    const pad = chord * 0.018 * (0.65 + 0.35 * Math.sin(2 * Math.PI * 0.08 * t));

    let pluck = 0;
    if (beatIdx % 2 === 0) {
      const f = pent[melody[beatIdx % melody.length] % pent.length];
      const pe = Math.exp(-into * 6.5);
      pluck = Math.sin(2 * Math.PI * f * t) * 0.07 * pe + Math.sin(2 * Math.PI * f * 2 * t) * 0.02 * pe;
    }

    const hit = beatIdx % 2 === 1 && into < 0.03;
    hat = hit ? rnd() : hat * 0.82 + rnd() * 0.18;
    const hatAmp = into < 0.045 ? (1 - into / 0.045) * 0.015 : 0;

    const sample = (bass + pad + pluck + hat * hatAmp) * env;
    const wide = Math.sin(2 * Math.PI * root * 2 * t) * 0.01 * bassEnv * env;
    L[i] = sample + wide;
    R[i] = sample - wide;
  }

  let peak = 0.001;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const gain = 0.42 / peak;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(clamp16(L[i] * gain), 44 + i * 4);
    buf.writeInt16LE(clamp16(R[i] * gain), 46 + i * 4);
  }
  return buf;
}

export async function writeSoundtrack({ outDir, duration, hits, sfxDir }) {
  const bedPath = path.join(outDir, 'bed.wav');
  await fs.writeFile(bedPath, renderBed(duration));
  const clickSrc = path.join(sfxDir, 'ui/click1.ogg');
  const clickWav = path.join(outDir, 'click.wav');
  await ffmpeg(['-i', clickSrc, '-ac', '2', '-ar', String(SR), clickWav]);

  const usable = hits.filter(t => t > 0.05 && t < duration - 0.2);
  if (!usable.length) {
    await fs.copyFile(bedPath, path.join(outDir, 'soundtrack.wav'));
    return path.join(outDir, 'soundtrack.wav');
  }
  const args = ['-i', bedPath];
  for (let i = 0; i < usable.length; i++) args.push('-i', clickWav);
  const filters = usable.map((t, i) => {
    const ms = Math.round(t * 1000);
    return `[${i + 1}:a]adelay=${ms}|${ms},volume=0.16[c${i}]`;
  });
  const mixIns = `[0:a]${usable.map((_, i) => `[c${i}]`).join('')}`;
  filters.push(`${mixIns}amix=inputs=${usable.length + 1}:duration=first:dropout_transition=0:normalize=0[a]`);
  args.push('-filter_complex', filters.join(';'), '-map', '[a]', path.join(outDir, 'soundtrack.wav'));
  await ffmpeg(args);
  return path.join(outDir, 'soundtrack.wav');
}
