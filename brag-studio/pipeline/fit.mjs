/** Pure timing helpers for the storyboard. No browser, no ffmpeg. */

export function wordCount(text) {
  return String(text || '')
    .replace(/[·•|/]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Settled reading time. Short labels get 0.8s; longer lines get 0.3s per word. */
export function readingSeconds(text) {
  const n = wordCount(text);
  if (n <= 3) return 0.8;
  return Math.max(1.2, n * 0.3);
}

export function easeInOut(t) {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2;
}

/**
 * Place a source window inside a captured step so the output scene
 * lasts `duration` seconds at a playback rate between minRate and maxRate.
 * `cue` is a source timestamp that should land at fraction `cueAt` of the scene.
 */
export function placeWindow({ t0, t1, cue = null, cueAt = 0.35, duration, maxRate = 1.55, minRate = 0.9, trimStart = 0.15, trimEnd = 0.12 }) {
  const avail0 = t0 + trimStart;
  const avail1 = t1 - trimEnd;
  const avail = avail1 - avail0;
  if (!(avail > 0.2)) {
    throw new Error(`Captured step is too short (${avail.toFixed(2)}s usable).`);
  }
  const needed = duration * minRate;
  if (avail + 1e-3 < needed) {
    throw new Error(`Need ${needed.toFixed(2)}s of footage at ${minRate}x, only ${avail.toFixed(2)}s usable.`);
  }
  const rate = Math.min(maxRate, avail / duration);
  const srcDur = duration * rate;
  let srcIn = avail0;
  if (cue != null && Number.isFinite(cue)) {
    srcIn = cue - cueAt * srcDur;
  }
  srcIn = Math.min(Math.max(srcIn, avail0), avail1 - srcDur);
  return {
    srcIn,
    srcOut: srcIn + srcDur,
    rate,
    duration: srcDur / rate
  };
}

export function mapSourceTime(src, scene) {
  if (scene.hold) return null;
  if (src < scene.srcIn - 0.04 || src > scene.srcOut + 0.04) return null;
  return scene.start + (src - scene.srcIn) / scene.rate;
}

/** Opacity ramp used by the composer. Settled time excludes the fades. */
export function visibleWindow(inn, out, fade = 0.22) {
  return { settleIn: inn + fade, settleOut: Math.max(inn + fade, out - fade) };
}

export function pacingIssues(lines) {
  const issues = [];
  for (const line of lines) {
    const need = readingSeconds(line.text);
    const { settleIn, settleOut } = visibleWindow(line.in, line.out, line.fade ?? 0.22);
    const have = settleOut - settleIn;
    if (have + 1e-3 < need) {
      issues.push({
        id: line.id,
        text: line.text,
        have: Number(have.toFixed(2)),
        need: Number(need.toFixed(2))
      });
    }
  }
  return issues;
}

export function linesForScene(scene) {
  const d = scene.duration;
  const start = scene.start;
  const lines = [];
  const add = (id, text, inn, out = d) => {
    if (!text) return;
    lines.push({ id: `${scene.id}:${id}`, text, in: start + inn, out: start + out, fade: 0.22 });
  };
  if (scene.kind === 'hook') {
    add('pen', scene.copy.pen, 0.04);
    add('kicker', scene.copy.kicker, 0.06);
    (scene.copy.words || []).forEach((word, i) => add(`w${i}`, word, 0.14 + i * 0.62));
    add('sub', scene.copy.sub, 0.52);
  } else if (scene.kind === 'end') {
    add('pen', scene.copy.pen, 0.08);
    add('kicker', scene.copy.kicker, 0.1);
    add('title', scene.copy.title, 0.16);
    add('sub', scene.copy.sub, 0.42);
  } else {
    add('pen', scene.copy.pen, 0.04);
    add('kicker', scene.copy.kicker, 0.06);
    add('title', scene.copy.title, 0.1);
    add('sub', scene.copy.sub, 0.26);
    add('callout', scene.copy.callout, 0.42, Math.max(0.7, d - 0.08));
  }
  return lines;
}

export function relRect(box, shell) {
  if (!box || !shell) return null;
  return {
    x: (box.x - shell.x) / shell.width,
    y: (box.y - shell.y) / shell.height,
    w: box.width / shell.width,
    h: box.height / shell.height
  };
}
