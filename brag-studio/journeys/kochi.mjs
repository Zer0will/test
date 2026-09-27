/**
 * Kochi dine-in, table 7.
 * Browse, name a guest, add dishes, look at the shared cart, open the split bill.
 * Does not press Pay. The kitchen POST is answered in prepare() so nothing is sent.
 */

export const product = 'Kochi';

export const notes = `
Kochi Po-cha's dine-in screen (table-app) opens a menu for one table. Categories and prices come from the restaurant menu data. The first dish asks for a name, then further dishes can be added for someone else on the same check. The cart lists each person. Close-out can show one bill or a split by items, evenly, or a custom amount. This recording stops on the split. Pay is not pressed.
`;

export const posts = {
  linkedin: `Kochi is a dine-in ordering prototype.

Scan a table, browse the menu, put a name on each dish, and split one check.

Scan. Order. Split.

Prototype · no real payments.`,
  x: `Scan. Order. Split.

Kochi — dine-in ordering, built for restaurants. A prototype: menu, named guests, one table cart, split bill. No payment processed.`
};

export const scenes = [
  {
    id: 'hook',
    kind: 'hook',
    step: 'arrive',
    duration: 3.2,
    maxRate: 1.25,
    minRate: 0.92,
    cue: 'settled',
    cueAt: 0.25,
    zoom: [1, 1.04],
    dim: 0,
    copy: {
      pen: '코치포차',
      kicker: 'Table 7',
      words: ['Scan.', 'Order.', 'Split.'],
      sub: 'From the menu to the bill.'
    }
  },
  {
    id: 'menu',
    kind: 'feature',
    step: 'scroll',
    duration: 4.2,
    maxRate: 1.4,
    cue: 'moving',
    cueAt: 0.12,
    highlight: { mark: 'rail', in: 0.45, out: 3.8 },
    zoom: [1, 1.08],
    copy: {
      kicker: 'Scan',
      title: 'The menu on the table',
      sub: "Scroll the categories. Prices are the restaurant's.",
      callout: 'Table 7'
    }
  },
  {
    id: 'sheet',
    kind: 'feature',
    step: 'sheet',
    duration: 4.0,
    maxRate: 1.3,
    cue: 'open',
    cueAt: 0.22,
    highlight: { mark: 'title', in: 0.4, out: 3.6 },
    zoom: [1.02, 1.14],
    copy: {
      kicker: 'Order',
      title: 'Choose a dish',
      sub: 'Beef bulgogi, from the grilled menu.',
      callout: 'Item sheet'
    }
  },
  {
    id: 'identity',
    kind: 'feature',
    step: 'identity',
    duration: 4.6,
    maxRate: 1.3,
    cue: 'typing',
    cueAt: 0.3,
    highlight: { mark: 'modal', in: 0.2, out: 3.4 },
    zoom: [1.02, 1.12],
    copy: {
      kicker: 'Order',
      title: "Name who's ordering",
      sub: "A name goes on the dish before it's added.",
      callout: 'Guest name'
    }
  },
  {
    id: 'cart',
    kind: 'feature',
    step: 'cart',
    duration: 4.2,
    maxRate: 1.25,
    cue: 'both',
    cueAt: 0.18,
    highlight: { mark: 'lines', in: 0.35, out: 3.9 },
    zoom: [1.02, 1.1],
    copy: {
      kicker: 'Order',
      title: 'One cart for the table',
      sub: 'Two guests. Two dishes. One check.',
      callout: 'Shared cart'
    }
  },
  {
    id: 'split',
    kind: 'feature',
    step: 'split',
    duration: 4.6,
    maxRate: 1.35,
    cue: 'even',
    cueAt: 0.42,
    highlight: { mark: 'shares', in: 0.5, out: 4.3 },
    zoom: [1.02, 1.12],
    copy: {
      kicker: 'Split',
      title: 'Split the bill',
      sub: 'By the items, or evenly. Nothing was charged.',
      callout: 'Preview only'
    }
  },
  {
    id: 'end',
    kind: 'end',
    duration: 3.2,
    holdScene: 'menu',
    dim: 0.55,
    zoom: [1, 1.04],
    copy: {
      kicker: 'Prototype',
      title: 'Kochi',
      sub: 'Dine-in ordering, built for restaurants'
    }
  }
];

export async function prepare(page) {
  const preview = JSON.stringify({ ok: true, roundId: 'PREVIEW', mode: 'preview_no_kitchen_notification' });
  await page.route('**/api/round', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: preview
  }));
  await page.route('**/api/order', route => route.abort());
}

export async function run(ctx) {
  const { page } = ctx;

  await ctx.step('arrive', async () => {
    await page.waitForSelector('.card');
    await ctx.sleep(500);
    await ctx.glide('.card');
    await ctx.sleep(900);
    ctx.cue('settled');
    await ctx.glide(page.locator('.card', { hasText: 'Beef Bulgogi' }));
    await ctx.sleep(2200);
  });

  await ctx.step('scroll', async () => {
    await ctx.glide('.grid-wrap');
    ctx.cue('moving');
    await ctx.mark('rail', '.rail');
    await ctx.wheel(340, 2000);
    await ctx.sleep(450);
    await ctx.wheel(260, 1700);
    await ctx.sleep(700);
    await ctx.wheel(-220, 1100);
    await ctx.sleep(400);
  });

  await ctx.step('sheet', async () => {
    await page.locator('.grid-wrap').evaluate(el => el.scrollTo({ top: 0, behavior: 'smooth' }));
    await ctx.sleep(700);
    await ctx.tap(page.locator('.card', { hasText: 'Beef Bulgogi' }));
    await page.waitForSelector('.sheet .title-row');
    ctx.cue('open');
    await ctx.sleep(500);
    await ctx.mark('title', '.sheet .title-row');
    await ctx.sleep(2800);
  });

  await ctx.step('identity', async () => {
    await ctx.tap('.btn-add');
    await page.waitForSelector('.identity-modal input');
    await ctx.sleep(900);
    ctx.cue('typing');
    await ctx.mark('modal', '.identity-modal');
    await ctx.typeInto('.identity-modal input', 'Mina');
    await ctx.sleep(700);
    await ctx.tap('.identity-modal .btn-primary');
    await page.waitForSelector('.cartbar');
    await ctx.sleep(2000);
  });

  await ctx.step('party', async () => {
    await ctx.tap('.cartbar');
    await page.waitForSelector('.cart-scroll');
    await ctx.sleep(600);
    await ctx.tap(page.getByRole('button', { name: /Add another person/ }));
    await page.waitForSelector('.identity-modal input');
    await ctx.sleep(400);
    await ctx.typeInto('.identity-modal input', 'Eli');
    await ctx.sleep(400);
    await ctx.tap('.identity-modal .btn-primary');
    await ctx.sleep(500);
    await ctx.tap(page.getByRole('button', { name: 'Add more' }));
    await page.waitForSelector('.card');
    await page.locator('.grid-wrap').evaluate(el => el.scrollTo({ top: 0, behavior: 'instant' }));
    await ctx.sleep(300);
    await ctx.tap(page.locator('.card', { hasText: 'Spicy Pork Bulgogi' }));
    await page.waitForSelector('.sheet');
    await ctx.sleep(700);
    await ctx.tap('.btn-add');
    await page.waitForSelector('.cartbar');
    await ctx.sleep(800);
  });

  await ctx.step('cart', async () => {
    await ctx.tap('.cartbar');
    await page.waitForSelector('.line');
    ctx.cue('both');
    await ctx.sleep(400);
    await ctx.mark('lines', '.line');
    await ctx.sleep(4200);
  });

  await ctx.step('send', async () => {
    await ctx.tap(page.getByRole('button', { name: /Send round/ }));
    await page.waitForSelector('.sent-banner');
    await ctx.sleep(900);
  });

  await ctx.step('split', async () => {
    await ctx.tap(page.getByRole('button', { name: /Close out/ }));
    await page.waitForSelector('.receipt');
    await ctx.sleep(1100);
    await ctx.tap(page.getByRole('tab', { name: 'Split by person' }));
    await page.waitForSelector('.shares');
    await ctx.sleep(900);
    await ctx.tap(page.getByRole('tab', { name: 'Evenly' }));
    ctx.cue('even');
    await ctx.sleep(500);
    await ctx.mark('shares', '.shares');
    await ctx.sleep(2400);
  });
}
