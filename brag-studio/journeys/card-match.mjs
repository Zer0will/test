/**
 * Card Match, recorded on the live quiz.
 * Sample choices only. No typed personal or financial details.
 * The result is whatever the live site returns.
 */

export const product = 'Card Match';
export const device = 'laptop';
export const frame = 'viewport';
export const viewport = { width: 1366, height: 768 };
export const cursor = {
  fill: 'rgba(212, 168, 67, 0.95)',
  down: '#f1f5f9',
  ring: 'rgba(212, 168, 67, .95)'
};
export const theme = {
  bg: '#050a18',
  ink: '#f1f5f9',
  inkSoft: '#cbd5e1',
  kicker: '#d4a843',
  hot: '#f3e6c4',
  display: 'Instrument Serif',
  displayWeight: 400,
  glow: '212,168,67',
  glow2: '243,230,196'
};

export const notes = `
Card Match is a short survey about spending habits and goals, then a recommendation with reasoning. Will described an OpenAI API. The live homepage says the match is powered by Claude. On this recording the generate call returned source "fallback", and the result page calls the answer a deterministic backup. The journey selects sample ranges only and does not type personal or financial details.
`;

export const posts = {
  linkedin: `Card Match asks a short survey about spending and goals, then lays out a card recommendation with reasoning.

This pass uses sample choices. The live result comes back labeled as a backup recommendation.`,
  x: `Card Match. A short survey, then a card recommendation with reasoning.

Sample choices. The live result is labeled a backup.`
};

const pace = { maxRate: 1.4, minRate: 0.8 };

export const scenes = [
  {
    id: 'hook',
    kind: 'hook',
    step: 'arrive',
    duration: 3.0,
    ...pace,
    cue: 'settled',
    cueAt: 0.24,
    zoom: [1, 1.012],
    dim: 0,
    copy: {
      kicker: 'Card Match',
      words: ['Survey.', 'Result.', 'Reason.'],
      sub: 'A short set of questions.'
    }
  },
  {
    id: 'survey',
    kind: 'feature',
    step: 'survey',
    duration: 10.0,
    ...pace,
    cue: 'asking',
    cueAt: 0.12,
    zoom: [1, 1.015],
    copy: {
      kicker: 'Survey',
      title: 'Spending, travel, and goals',
      sub: 'Sample choices, nothing personal.',
      callout: 'Short survey'
    }
  },
  {
    id: 'result',
    kind: 'feature',
    step: 'result',
    duration: 9.0,
    ...pace,
    cue: 'shown',
    cueAt: 0.28,
    zoom: [1, 1.02],
    copy: {
      kicker: 'Result',
      title: 'A wallet, with reasoning',
      sub: 'The page calls this one a backup.',
      callout: 'Clean result'
    }
  },
  {
    id: 'end',
    kind: 'end',
    duration: 3.6,
    holdScene: 'result',
    dim: 0.42,
    zoom: [1, 1],
    copy: {
      kicker: 'Live',
      title: 'Card Match',
      sub: 'A short survey, then a result.'
    }
  }
];

const GUTTER = { x: 20, y: 460 };

const CHOICES = [
  /\$500/,
  /Groceries/,
  /live with family/,
  /A few times a year/,
  /points-focused/,
  /Maximize cash back/,
  /Up to ~\$100/,
  /right card per category/,
  /^Not sure/,
  /starting fresh/,
  /just personal spending/,
  /I'm done/
];

async function approach(ctx, locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error('Target is not visible');
  await ctx.jump(Math.max(8, box.x - 28), box.y + box.height / 2);
  await ctx.tap(locator);
}

export async function run(ctx) {
  const { page } = ctx;
  await ctx.jump(GUTTER.x, GUTTER.y);

  await ctx.step('arrive', async () => {
    await page.getByRole('heading', { name: /Your wallet/ }).waitFor();
    await ctx.sleep(500);
    ctx.cue('settled');
    await ctx.sleep(2400);
  });

  await ctx.step('survey', async () => {
    await approach(ctx, page.getByRole('link', { name: /2-minute survey/ }).first());
    await page.getByRole('heading', { name: /monthly credit card spend/i }).waitFor();
    ctx.cue('asking');
    await ctx.jump(GUTTER.x, 360);
    await ctx.sleep(700);
    for (const pattern of CHOICES) {
      const choice = page.getByRole('button', { name: pattern }).first();
      await approach(ctx, choice);
      await ctx.sleep(160);
      const next = page.getByRole('button', { name: /^(Next|Get my wallet)$/ });
      await approach(ctx, next);
      await ctx.jump(GUTTER.x, 360);
      await ctx.sleep(180);
    }
  });

  await ctx.step('result', async () => {
    await page.waitForURL(/\/results\//, { timeout: 60000 });
    await page.getByText(/backup|wallet/i).first().waitFor();
    ctx.cue('shown');
    await ctx.jump(GUTTER.x, 420);
    await ctx.sleep(2000);
    await ctx.wheel(360, 1100);
    await ctx.sleep(1400);
    await ctx.wheel(280, 900);
    await ctx.sleep(1200);
  });
}
