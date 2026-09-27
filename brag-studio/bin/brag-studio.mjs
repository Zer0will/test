#!/usr/bin/env node
import { run } from '../pipeline/run.mjs';

const help = `brag-studio — record a live product journey and cut a launch video.

Usage
  node brag-studio/bin/brag-studio.mjs --url <url> --journey <script> --format landscape|vertical|square

Options
  --disclaimers <file>   JSON with a disclaimers array. Required for honest on-screen labels.
  --out <dir>            Output directory. Default: runs/brag
  --reuse                Skip capture and rebuild the edit from the last recording.

The journey module exports run(ctx), scenes, and posts. See journeys/kochi.mjs.
Music is generated in-process. Sound effects are the CC0 Kenney files shipped with brag.
No voiceover unless a journey asks for it. This command does not call a paid generator.
`;

function parse(argv) {
  const out = { reuse: false, format: 'landscape' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') out.help = true;
    else if (arg === '--reuse') out.reuse = true;
    else if (arg.startsWith('--')) out[arg.slice(2)] = argv[++i];
    else throw new Error(`Unexpected argument ${arg}`);
  }
  return out;
}

const args = parse(process.argv.slice(2));
if (args.help || !args.url || !args.journey) {
  console.log(help);
  process.exit(args.help ? 0 : 1);
}
if (!['landscape', 'vertical', 'square'].includes(args.format)) {
  console.error('Format must be landscape, vertical, or square.');
  process.exit(1);
}

run(args).catch(err => {
  console.error(err.stack || err.message);
  process.exit(1);
});
