import test from 'node:test';
import assert from 'node:assert/strict';
import { linesForScene, pacingIssues, placeWindow, readingSeconds } from './fit.mjs';
import { assertHonest } from './honesty.mjs';
import { auditLayout, layoutFor } from './layout.mjs';
import { publicBlocks } from './storyboard.mjs';
import { scenes, posts } from '../journeys/kochi.mjs';
import { scenes as tideScenes, posts as tidePosts } from '../journeys/wired-tides.mjs';
import { scenes as chessScenes, posts as chessPosts } from '../journeys/edmonds-chess.mjs';
import { scenes as cardScenes, posts as cardPosts } from '../journeys/card-match.mjs';
import { scenes as card15Scenes, durationRange as card15Range } from '../journeys/card-match-15.mjs';

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
  const { phone, copyX, textWidth, gap, width } = layout;
  assert.equal(phone.x, copyX + textWidth + gap);
  assert.ok(gap >= 80 && gap <= 160);
  const right = width - (phone.x + phone.w);
  assert.ok(Math.abs(copyX - right) <= 1);
  assert.ok(phone.h > 920);
  assert.equal(layout.device, 'phone');
});

test('landscape laptop group stays centered', () => {
  const layout = layoutFor('landscape', { device: 'laptop' });
  assert.equal(layout.device, 'laptop');
  assert.deepEqual(auditLayout(layout), []);
  const { phone, copyX, textWidth, gap, width } = layout;
  assert.equal(phone.x, copyX + textWidth + gap);
  const right = width - (phone.x + phone.w);
  assert.ok(Math.abs(copyX - right) <= 1);
  assert.ok(phone.w > phone.h);
  assert.ok(Math.abs(phone.w / phone.h - 1366 / 768) < 0.02);
});

test('wired tides copy is honest and readable', () => {
  let t = 0;
  const built = tideScenes.map(spec => {
    const scene = { ...spec, start: t, duration: spec.duration, end: t + spec.duration };
    t += spec.duration;
    return scene;
  });
  assert.ok(t >= 20 && t <= 30, `duration ${t}`);
  const lines = built.flatMap(linesForScene);
  assert.deepEqual(pacingIssues(lines), []);
  const hits = assertHonest(publicBlocks({
    scenes: built,
    posts: tidePosts,
    disclaimer: 'A recording of the live site.'
  }));
  assert.deepEqual(hits, []);
});

test('edmonds chess copy is honest and readable', () => {
  let t = 0;
  const built = chessScenes.map(spec => {
    const scene = { ...spec, start: t, duration: spec.duration, end: t + spec.duration };
    t += spec.duration;
    return scene;
  });
  assert.ok(t >= 28 && t <= 35, `duration ${t}`);
  assert.deepEqual(pacingIssues(built.flatMap(linesForScene)), []);
  const hits = assertHonest(publicBlocks({
    scenes: built,
    posts: chessPosts,
    disclaimer: 'Live public site, plus a supplied admin recording.'
  }));
  assert.deepEqual(hits, []);
});

test('card match copy is honest and readable', () => {
  const check = (list, range) => {
    let t = 0;
    const built = list.map(spec => {
      const scene = { ...spec, start: t, duration: spec.duration, end: t + spec.duration };
      t += spec.duration;
      return scene;
    });
    assert.ok(t >= range.min && t <= range.max, `duration ${t}`);
    assert.deepEqual(pacingIssues(built.flatMap(linesForScene)), []);
    return built;
  };
  const built = check(cardScenes, { min: 20, max: 30 });
  check(card15Scenes, card15Range);
  const hits = assertHonest(publicBlocks({
    scenes: built,
    posts: cardPosts,
    disclaimer: 'A recording of the live site.'
  }));
  assert.deepEqual(hits, []);
});

test('invented claims are rejected', () => {
  const hits = assertHonest([
    { where: 'x', text: 'Trusted by 500 restaurants' },
    { where: 'y', text: 'Stripe checkout is live' }
  ]);
  assert.ok(hits.some(h => h.id === 'trusted' || h.id === 'big-count'));
  assert.ok(hits.some(h => h.id === 'stripe'));
});
