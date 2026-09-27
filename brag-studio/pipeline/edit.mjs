import { linesForScene, placeWindow, relRect, mapSourceTime } from './fit.mjs';

export function buildTimeline(meta, specs) {
  let t = 0;
  const scenes = [];
  for (const spec of specs) {
    if (spec.kind === 'end') {
    const source = spec.holdScene ? scenes.find(s => s.id === spec.holdScene) : scenes.at(-1);
    if (spec.holdScene && !source) {
      throw new Error(`End scene "${spec.id}" holds "${spec.holdScene}", which is not an earlier scene.`);
    }
    const duration = spec.duration;
    const holdAt = source
      ? (spec.holdAt ?? (source.srcIn + source.srcOut) / 2)
      : 0;
      const scene = {
        id: spec.id,
        kind: 'end',
        copy: spec.copy,
        start: t,
        end: t + duration,
        duration,
        hold: true,
        holdAt,
        zoomFrom: spec.zoom?.[0] ?? 1,
        zoomTo: spec.zoom?.[1] ?? 1.04,
        originX: 50,
        originY: 42,
        dim: spec.dim ?? 0.45,
        highlight: null,
        footage: 'held-live-frame'
      };
      scenes.push(scene);
      t = scene.end;
      continue;
    }
    const step = meta.steps.find(s => s.id === spec.step);
    if (!step) throw new Error(`Journey did not record step "${spec.step}".`);
    const cue = spec.cue ? step.cues?.[spec.cue] : null;
    if (spec.cue && !Number.isFinite(cue)) throw new Error(`Step "${spec.step}" has no cue "${spec.cue}".`);
    let placed;
    try {
      placed = placeWindow({
        t0: step.t0,
        t1: step.t1,
        cue,
        cueAt: spec.cueAt ?? 0.3,
        duration: spec.duration,
        maxRate: spec.maxRate ?? 1.5,
        minRate: spec.minRate ?? 0.9,
        trimStart: spec.trimStart ?? 0.12,
        trimEnd: spec.trimEnd ?? 0.1
      });
    } catch (err) {
      throw new Error(`Scene "${spec.id}" (${spec.step} ${step.t0.toFixed(2)}–${step.t1.toFixed(2)}s): ${err.message}`);
    }
    let highlight = null;
    if (spec.highlight && step.marks?.[spec.highlight.mark] && meta.shell) {
      const rel = relRect(step.marks[spec.highlight.mark], meta.shell);
      if (rel && rel.w > 0.02 && rel.h > 0.02) {
        highlight = {
          ...rel,
          in: spec.highlight.in ?? 0.35,
          out: spec.highlight.out ?? placed.duration - 0.15
        };
      }
    }
    const origin = highlight
      ? [
          Math.min(78, Math.max(22, (highlight.x + highlight.w / 2) * 100)),
          Math.min(78, Math.max(22, (highlight.y + highlight.h / 2) * 100))
        ]
      : (spec.origin ?? [50, 46]);
    const scene = {
      id: spec.id,
      kind: spec.kind,
      copy: spec.copy,
      start: t,
      duration: placed.duration,
      end: t + placed.duration,
      srcIn: placed.srcIn,
      srcOut: placed.srcOut,
      rate: placed.rate,
      hold: false,
      zoomFrom: spec.zoom?.[0] ?? 1,
      zoomTo: spec.zoom?.[1] ?? 1.06,
      originX: origin[0],
      originY: origin[1],
      dim: spec.dim ?? 0,
      highlight,
      footage: 'live'
    };
    scenes.push(scene);
    t = scene.end;
  }
  const lines = scenes.flatMap(linesForScene);
  const taps = [];
  for (const tap of meta.taps || []) {
    for (const scene of scenes) {
      const at = mapSourceTime(tap.t, scene);
      if (at != null) taps.push(Number(at.toFixed(3)));
    }
  }
  return { scenes, lines, duration: t, taps };
}
