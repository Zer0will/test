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
Dine-in ordering prototype. The picture is a screen recording of ${url}, cropped to the phone the site already draws at desktop size.

## Honesty
On-screen disclaimer: ${disclaimer}

This storyboard does not add metrics, customers, or integrations. Prices, dish names, and the split controls are whatever the app showed during the capture. Payment is not completed, and no payment details are entered. The Kochi example is a recording of the live table page.

## Footage
Every scene except the end card is live recording, played back slightly faster. The end card holds one frame from the menu recording and adds type on top.

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
