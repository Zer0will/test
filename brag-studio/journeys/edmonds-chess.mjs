/**
 * Edmonds Chess Club, recorded on the live public site.
 * Scroll the homepage, play the engine, then open meets and the team page.
 * Does not sign in, submit a form, or open the admin area.
 */

export const product = 'Edmonds Chess Club';
export const device = 'laptop';
export const frame = 'viewport';
export const viewport = { width: 1366, height: 768 };
export const cursor = {
  fill: 'rgba(201, 169, 110, 0.95)',
  down: '#f6f2e6',
  ring: 'rgba(201, 169, 110, .95)'
};
export const theme = {
  bg: '#050a1a',
  ink: '#f6f2e6',
  inkSoft: '#d9d0be',
  kicker: '#c9a96e',
  hot: '#f0d9a0',
  display: 'Sora',
  displayWeight: 600,
  glow: '201,169,110',
  glow2: '240,217,160'
};

export const notes = `
Edmonds Chess Club is a live website for a local chess club, in use by its members. The public site has club pages and a chess bot. The recording plays a few moves against that bot on the live board and visits the homepage, weekly meets, and team page. A private admin area is a CMS for content, member profiles, image storage, and security hardening, so a volunteer can maintain the site. This recording does not sign in, submit a form, or open the admin area.
`;

export const posts = {
  linkedin: `Edmonds Chess Club has a live website its members use.

Public pages for the club, a chess bot on the board, and a private admin CMS a volunteer can maintain: member profiles, image storage, and security hardening.

Built so the club can run it without a developer on call.`,
  x: `Edmonds Chess Club. A live public site, a chess bot on the board, and an admin CMS a volunteer can maintain.

Member profiles, image storage, and security hardening. No developer on call.`
};

const pace = { maxRate: 1.35, minRate: 0.8 };

export const scenes = [
  {
    id: 'hook',
    kind: 'hook',
    step: 'arrive',
    duration: 3.4,
    ...pace,
    cue: 'settled',
    cueAt: 0.24,
    zoom: [1, 1.012],
    dim: 0,
    copy: {
      kicker: 'Edmonds Chess Club',
      words: ['Public.', 'Playable.', 'Live.'],
      sub: 'A site for the chess club.'
    }
  },
  {
    id: 'scroll',
    kind: 'feature',
    step: 'scroll',
    duration: 4.4,
    ...pace,
    cue: 'moving',
    cueAt: 0.12,
    zoom: [1, 1.015],
    copy: {
      kicker: 'Public site',
      title: 'The public club site',
      sub: 'Homepage, meets, and the team.'
    }
  },
  {
    id: 'bot',
    kind: 'feature',
    step: 'bot',
    duration: 8.0,
    ...pace,
    cue: 'answered',
    cueAt: 0.62,
    zoom: [1, 1.02],
    copy: {
      kicker: 'Chess bot',
      title: 'A few moves against the bot',
      sub: 'It answers on the board.',
      callout: 'Chess bot'
    }
  },
  {
    id: 'pages',
    kind: 'feature',
    step: 'pages',
    duration: 4.6,
    ...pace,
    cue: 'team',
    cueAt: 0.55,
    zoom: [1, 1.012],
    copy: {
      kicker: 'Pages',
      title: 'Meets and the team',
      sub: 'Public pages for the club.'
    }
  },
  {
    id: 'maintain',
    kind: 'feature',
    step: 'maintain',
    duration: 3.8,
    ...pace,
    cue: 'home',
    cueAt: 0.3,
    zoom: [1, 1.012],
    copy: {
      kicker: 'For the club',
      title: 'A volunteer can maintain it',
      sub: 'Member profiles, image storage, and security hardening.',
      callout: 'Admin CMS'
    }
  },
  {
    id: 'end',
    kind: 'end',
    duration: 3.6,
    holdScene: 'bot',
    dim: 0.45,
    zoom: [1, 1],
    copy: {
      kicker: 'Live',
      title: 'Edmonds Chess Club',
      sub: 'A public site the club can keep.'
    }
  }
];

const GUTTER = { x: 18, y: 420 };

async function approach(ctx, locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error('Target is not visible');
  const y = box.y + box.height / 2;
  await ctx.jump(Math.max(8, box.x - 24), y);
  await ctx.tap(locator);
}

async function playSquare(ctx, index) {
  const square = ctx.page.locator('.cboard .csq').nth(index);
  await approach(ctx, square);
}

export async function run(ctx) {
  const { page } = ctx;
  await ctx.jump(GUTTER.x, GUTTER.y);

  await ctx.step('arrive', async () => {
    await page.getByRole('heading', { level: 1, name: /Your move/ }).waitFor();
    await ctx.sleep(600);
    ctx.cue('settled');
    await ctx.sleep(2600);
  });

  await ctx.step('scroll', async () => {
    await ctx.rest(GUTTER.x, GUTTER.y);
    ctx.cue('moving');
    await ctx.wheel(620, 1200);
    await ctx.sleep(280);
    await ctx.wheel(740, 1400);
    await ctx.sleep(360);
    await ctx.wheel(680, 1300);
    await ctx.sleep(400);
  });

  await ctx.step('bot', async () => {
    await ctx.jump(GUTTER.x, 80);
    await approach(ctx, page.getByRole('link', { name: 'Play', exact: true }).first());
    await page.getByRole('heading', { name: /board's open/ }).waitFor();
    await page.locator('.cboard').evaluate(el => el.scrollIntoView({ block: 'center', inline: 'nearest' }));
    await ctx.sleep(350);
    await playSquare(ctx, 52);
    await ctx.sleep(160);
    await playSquare(ctx, 36);
    await page.waitForFunction(() => document.body.innerText.includes('Nf6'), { timeout: 8000 });
    await ctx.sleep(700);
    await playSquare(ctx, 62);
    await ctx.sleep(160);
    await playSquare(ctx, 45);
    await page.waitForFunction(() => document.body.innerText.includes('4 PLY'), { timeout: 8000 });
    ctx.cue('answered');
    await ctx.jump(GUTTER.x, 520);
    await ctx.sleep(1800);
  });

  await ctx.step('pages', async () => {
    await approach(ctx, page.getByRole('link', { name: 'Weekly Meets' }).first());
    await page.getByRole('heading', { name: /Boards on the table/ }).waitFor();
    await ctx.jump(GUTTER.x, 360);
    await ctx.sleep(1400);
    await approach(ctx, page.getByRole('link', { name: 'Team', exact: true }).first());
    await page.getByRole('heading', { name: /Meet the officers/ }).waitFor();
    ctx.cue('team');
    await ctx.jump(GUTTER.x, 360);
    await ctx.sleep(1500);
  });

  await ctx.step('maintain', async () => {
    await approach(ctx, page.getByRole('link', { name: 'Home', exact: true }).first());
    await page.getByRole('heading', { level: 1, name: /Your move/ }).waitFor();
    ctx.cue('home');
    await ctx.jump(GUTTER.x, GUTTER.y);
    await ctx.sleep(2800);
  });
}
