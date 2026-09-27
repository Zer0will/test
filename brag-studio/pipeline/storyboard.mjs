import fs from 'node:fs/promises';
import path from 'node:path';
import { pacingIssues } from './fit.mjs';

export function publicBlocks({ scenes, posts, disclaimer }) {
  const blocks = [{ where: 'disclaimer', text: disclaimer }];
  for (const scene of scenes) {
    const copy = scene.copy || {};
    for (const [key, value] of Object.entries(copy)) {
      const text = Array.isArray(value) ? value.join(' ') : value;
      if (text) blocks.push({ where: `${scene.id}.${key}`, text });
    }
  }
  for (const [where, text] of Object.entries(posts || {})) blocks.push({ where, text });
  return blocks;
}

export function writePlan({ product, url, scenes, duration, disclaimer, notes, posts }) {
  const footage = scenes.map(s => {
    const rate = s.hold ? 'held frame' : `${s.rate.toFixed(2)}x`;
    return `- **${s.id}** (${s.start.toFixed(1)}–${s.end.toFixed(1)}s, ${s.footage}, ${rate}) — ${s.copy.title || (s.copy.words || []).join(' ')}`;
  }).join('\n');
  return `# Brag plan: ${product}

## What this is
A screen recording of ${url}. The device window and the caption column are one centered group.

## Honesty
On-screen disclaimer: ${disclaimer}

The storyboard does not add metrics, customers, or integrations. Claims stay inside the notes below.

## Footage
Every scene except the end card is live recording. The end card holds one frame from the recording and adds type on top.

${footage}

Duration: ${duration.toFixed(2)}s. Format: 1920×1080, 30 fps. No voiceover.

## Notes from the product
${notes.trim()}

## Post copy

### LinkedIn
${posts.linkedin.trim()}

### X
${posts.x.trim()}
`;
}

export async function writeOutputs(outDir, plan, posts) {
  await fs.writeFile(path.join(outDir, 'brag-plan.md'), plan);
  const share = `LinkedIn\n${posts.linkedin.trim()}\n\nX\n${posts.x.trim()}\n`;
  await fs.writeFile(path.join(outDir, 'share-copy.txt'), share);
}

export function checkPacing(lines) {
  return pacingIssues(lines);
}
