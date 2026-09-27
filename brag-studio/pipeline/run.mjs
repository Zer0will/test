import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { captureJourney } from './capture.mjs';
import { buildClips } from './clips.mjs';
import { writeComposition } from './compose.mjs';
import { buildTimeline } from './edit.mjs';
import { assertHonest, disclaimerLines } from './honesty.mjs';
import { auditBoxes, auditLayout, layoutFor } from './layout.mjs';
import { writeSoundtrack } from './music.mjs';
import { encode, openComposition, renderFrames, sampleBoxes, serve } from './render.mjs';
import { reviewVideo } from './review.mjs';
import { checkPacing, publicBlocks, writeOutputs, writePlan } from './storyboard.mjs';
import { ffmpeg } from './clips.mjs';

export async function run(options) {
  const log = msg => console.log(`[brag-studio] ${msg}`);
  const journeyPath = path.resolve(options.journey);
  const journey = await import(pathToFileURL(journeyPath).href);
  const format = options.format || 'landscape';
  const outDir = path.resolve(options.out || 'runs/brag');
  await fs.mkdir(outDir, { recursive: true });

  const disclaimerFile = options.disclaimers
    ? JSON.parse(await fs.readFile(path.resolve(options.disclaimers), 'utf8'))
    : (journey.disclaimers || {});
  const disclaimers = disclaimerLines(disclaimerFile);
  const disclaimer = disclaimers[0];
  const posts = journey.posts;
  const specs = journey.scenes;

  const draftScenes = specs.map(spec => ({ id: spec.id, copy: spec.copy, kind: spec.kind }));
  const honesty = assertHonest(publicBlocks({ scenes: draftScenes, posts, disclaimer }), {
    allow: flattenAllow(disclaimerFile.allow),
    extraPatterns: disclaimerFile.bannedPatterns || []
  });
  if (honesty.length) {
    throw new Error('Honesty check failed:\n' + honesty.map(h => `- ${h.where}: "${h.match}" (${h.why})`).join('\n'));
  }

  let meta;
  if (options.reuse) {
    meta = JSON.parse(await fs.readFile(path.join(outDir, 'capture-meta.json'), 'utf8')).meta;
    log('reusing capture');
  } else {
    meta = await captureJourney({ url: options.url, journey, outDir, onLog: log });
  }

  const timeline = buildTimeline(meta, specs);
  const pacing = checkPacing(timeline.lines);
  if (pacing.length) {
    throw new Error('Pacing check failed:\n' + pacing.map(p => `- ${p.id} visible ${p.have}s, needs ${p.need}s ("${p.text}")`).join('\n'));
  }
  if (!meta.shell) throw new Error('Could not find the product frame on the page.');
  if (meta.fps && meta.fps < 8) log(`warning: screencast was ${meta.fps.toFixed(1)} fps`);
  if (timeline.duration < 20 || timeline.duration > 30) {
    throw new Error(`Timeline is ${timeline.duration.toFixed(2)}s. Keep it between 20 and 30.`);
  }
  log(`timeline ${timeline.duration.toFixed(2)}s, ${timeline.scenes.length} scenes`);

  const notes = journey.notes || '';
  const plan = writePlan({
    product: journey.product || 'Product',
    url: options.url,
    scenes: timeline.scenes,
    duration: timeline.duration,
    disclaimer,
    notes,
    posts
  });
  await writeOutputs(outDir, plan, posts);
  await fs.writeFile(path.join(outDir, 'timeline.json'), JSON.stringify(timeline, null, 2));

  log('cutting live frames');
  await buildClips({ outDir, scenes: timeline.scenes, shell: meta.shell });

  const sfxDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../skills/brag/assets/sfx');
  log('writing soundtrack');
  await writeSoundtrack({ outDir, duration: timeline.duration, hits: timeline.taps, sfxDir });

  const device = journey.device || 'phone';
  const aspect = journey.viewport ? journey.viewport.width / journey.viewport.height : undefined;
  let fontScale = 1;
  let margin;
  let layout = layoutFor(format, { fontScale, device, aspect });
  margin = layout.margin;
  const server = await serve(outDir);
  let session = null;
  try {
    let issues = [];
    for (let attempt = 0; attempt < 3; attempt++) {
      layout = layoutFor(format, { fontScale, margin, device, aspect });
      await writeComposition(outDir, compositionData(layout, timeline, disclaimer, journey.theme));
      if (session) await session.close();
      session = await openComposition(server, layout);
      const times = sampleTimes(timeline.scenes);
      const samples = await sampleBoxes(session.page, times);
      issues = [...auditLayout(layout), ...auditBoxes(samples, layout)];
      await fs.writeFile(path.join(outDir, 'layout-audit.json'), JSON.stringify({ attempt, fontScale, margin, issues, samples }, null, 2));
      if (!issues.length) break;
      log(`layout issues (${issues.length}), adjusting type`);
      fontScale *= 0.92;
      if (issues.some(issue => issue.type === 'cutoff')) margin += 6;
    }
    if (issues.length) {
      throw new Error(`Layout audit failed: ${issues.slice(0, 8).map(i => i.type + ' ' + (i.id || i.a)).join(', ')}`);
    }

    const frameCount = Math.round(timeline.duration * 30);
    log(`rendering ${frameCount} frames`);
    await renderFrames(session.page, outDir, frameCount, log);
  } finally {
    if (session) await session.close();
    server.close();
  }

  log('encoding');
  const mp4 = await encode(outDir);
  const heroes = await heroStills(outDir, mp4, timeline.scenes);
  log('contact sheet');
  const report = await reviewVideo(mp4, {
    workDir: outDir,
    width: layout.width,
    height: layout.height,
    background: journey.theme?.bg
  });
  await fs.writeFile(path.join(outDir, 'review.json'), JSON.stringify({ ...report, heroes }, null, 2));
  if (!report.ok) {
    throw new Error('Picture review failed: ' + JSON.stringify(report.issues));
  }
  log(`done ${mp4} (${(report.bytes / 1024 / 1024).toFixed(1)} MB)`);
  return { outDir, mp4, report, heroes, duration: timeline.duration };
}

function compositionData(layout, timeline, disclaimer, theme) {
  const windows = {};
  for (const line of timeline.lines) windows[line.id] = { in: line.in, out: line.out };
  return {
    layout,
    scenes: timeline.scenes,
    windows,
    disclaimer,
    duration: timeline.duration,
    theme: theme || null
  };
}

function sampleTimes(scenes) {
  const times = [];
  for (const scene of scenes) {
    times.push(Number((scene.start + Math.min(scene.duration * 0.72, scene.duration - 0.28)).toFixed(3)));
    times.push(Number((scene.start + scene.duration * 0.45).toFixed(3)));
  }
  return times;
}

async function heroStills(outDir, mp4, scenes) {
  const picks = [
    ['hero-menu.jpg', scenes.find(s => s.kind === 'hook')],
    ['hero-split.jpg', scenes.find(s => s.id === 'split') || scenes.find(s => s.kind === 'feature')]
  ];
  const made = [];
  for (const [name, scene] of picks) {
    if (!scene) continue;
    const at = scene.start + scene.duration * 0.62;
    const dest = path.join(outDir, name);
    await ffmpeg(['-ss', at.toFixed(3), '-i', mp4, '-frames:v', '1', '-q:v', '2', dest]);
    made.push(dest);
  }
  return made;
}

function flattenAllow(allow = {}) {
  return Object.values(allow).flatMap(value => Array.isArray(value) ? value : []);
}

export function sfxRoot() {
  return path.resolve(path.dirname(new URL(import.meta.url).pathname), '../skills/brag/assets/sfx');
}
