import test from 'node:test';
import assert from 'node:assert/strict';
import { linesForScene, pacingIssues, placeWindow, readingSeconds } from './fit.mjs';
import { assertHonest } from './honesty.mjs';
import { auditLayout, layoutFor } from './layout.mjs';
import { publicBlocks } from './storyboard.mjs';
import { scenes, posts } from '../journeys/kochi.mjs';

test('reading time floors', () => {
  assert.equal(readingSeconds('Scan.'), 0.8);
  assert.equal(readingSeconds('From the menu to the bill.'), 6 * 0.3);
});

test('placeWindow keeps the scene length and the cue inside it', () => {
  const placed = placeWindow({ t0: 2, t1: 10, cue: 5, cueAt: 0.25, duration: 4, maxRate: 1.4, minRate: 0.9 });
  assert.ok(Math.abs(placed.duration - 4) < 0.01);
  assert.ok(placed.rate <= 1.4 + 1e-6);
  const cueOut = (5 - placed.srcIn) / placed.rate;
  assert.ok(Math.abs(cueOut - 1) < 0.15);
  assert.ok(placed.srcIn >= 2.12 - 0.02);
  assert.ok(placed.srcOut <= 10 - 0.1 + 0.02);
});

test('kochi copy is honest and readable', () => {
  let t = 0;
  const built = scenes.map(spec => {
    const scene = { ...spec, start: t, duration: spec.duration, end: t + spec.duration };
    t += spec.duration;
    return scene;
  });
  assert.ok(t >= 20 && t <= 30, `duration ${t}`);
  const lines = built.flatMap(linesForScene);
  const pacing = pacingIssues(lines);
  assert.deepEqual(pacing, []);
  const disclaimer = 'Prototype · no real payments';
  const hits = assertHonest(publicBlocks({ scenes: built, posts, disclaimer }), {
    allow: ['Table 7', '코치포차', 'Beef bulgogi']
  });
  assert.deepEqual(hits, []);
});

test('landscape phone sits inside the margin', () => {
  const layout = layoutFor('landscape');
  assert.equal(layout.width, 1920);
  assert.equal(layout.height, 1080);
  assert.deepEqual(auditLayout(layout), []);
  assert.deepEqual(auditLayout(layoutFor('vertical')), []);
  assert.deepEqual(auditLayout(layoutFor('square')), []);
});

test('invented claims are rejected', () => {
  const hits = assertHonest([
    { where: 'x', text: 'Trusted by 500 restaurants' },
    { where: 'y', text: 'Stripe checkout is live' }
  ]);
  assert.ok(hits.some(h => h.id === 'trusted' || h.id === 'big-count'));
  assert.ok(hits.some(h => h.id === 'stripe'));
});
