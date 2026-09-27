/**
 * Kochi dine-in, table 7, recorded on the live table page.
 * Join the check, add a dish, add a second person, look at the shared cart,
 * send the round, then open the split.
 * Does not press Pay and does not type payment details.
 */

export const product = 'Kochi';

export const notes = `
Kochi Po-cha's dine-in screen opens a menu for one table. Category buttons and prices come from the restaurant menu data. Joining the check asks for a name, then a dish can be added, then another person can join the same check. The cart lists each person with subtotal, tax, and total, and says the bill can be one check or split by person. This recording is the live table page. Sending the round uses the app's own preview response. The recording stops on the even split. Pay is not pressed, and no payment details are entered.
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
    duration: 3.0,
    maxRate: 1.2,
    minRate: 0.9,
    cue: 'settled',
    cueAt: 0.22,
    zoom: [1, 1.03],
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
    duration: 3.6,
    maxRate: 1.25,
    cue: 'moving',
    cueAt: 0.1,
    highlight: { mark: 'rail', in: 0.35, out: 3.3 },
    zoom: [1, 1.035],
    copy: {
      pen: '코치포차',
      kicker: 'Scan',
      title: 'The menu on the table',
      sub: 'Tabs for grilled, chicken, and the rest.',
      callout: 'Table 7'
    }
  },
  {
    id: 'identity',
    kind: 'feature',
    step: 'identity',
    duration: 4.4,
    maxRate: 1.2,
    cue: 'typing',
    cueAt: 0.26,
    highlight: { mark: 'modal', in: 0.15, out: 2.55 },
    zoom: [1, 1.05],
    copy: {
      kicker: 'Order',
      title: 'Join this check',
      sub: 'Type a name. The header shows who is ordering.',
      callout: 'Will'
    }
  },
  {
    id: 'sheet',
    kind: 'feature',
    step: 'sheet',
    duration: 3.8,
    maxRate: 1.15,
    cue: 'open',
    cueAt: 0.14,
    highlight: { mark: 'price', in: 0.28, out: 2.15 },
    zoom: [1, 1.045],
    copy: {
      kicker: 'Order',
      title: 'Add it to the cart',
      sub: 'The price sits on the add button.',
      callout: '$20.99'
    }
  },
  {
    id: 'cart',
    kind: 'feature',
    step: 'cart',
    duration: 6.2,
    maxRate: 1.38,
    cue: 'both',
    cueAt: 0.7,
    highlight: { mark: 'totals', in: 5.05, out: 5.95 },
    zoom: [1, 1.035],
    copy: {
      kicker: 'Order',
      title: 'One cart for the table',
      sub: 'Subtotal, tax, and one bill or a split.',
      callout: 'Pay at the end'
    }
  },
  {
    id: 'split',
    kind: 'feature',
    step: 'split',
    duration: 5.0,
    maxRate: 1.2,
    cue: 'even',
    cueAt: 0.58,
    highlight: { mark: 'shares', in: 3.15, out: 4.75 },
    zoom: [1, 1.04],
    copy: {
      kicker: 'Split',
      title: 'Split the bill',
      sub: 'Even split. The pay button is not pressed.',
      callout: 'Preview only'
    }
  },
  {
    id: 'end',
    kind: 'end',
    duration: 3.2,
    holdScene: 'menu',
    dim: 0.55,
    zoom: [1, 1.03],
    copy: {
      pen: '코치포차',
      kicker: 'Prototype',
      title: 'Kochi',
      sub: 'Dine-in ordering, built for restaurants'
    }
  }
];

async function hideStripe(page) {
  await page.locator('.sheet-scroll').evaluate(el => {
    el.scrollTo({ top: 220, behavior: 'smooth' });
  });
}

export async function run(ctx) {
  const { page } = ctx;

  await ctx.step('arrive', async () => {
    await page.waitForSelector('.card');
    await ctx.sleep(450);
    await ctx.glide('.party');
    await ctx.sleep(500);
    ctx.cue('settled');
    await ctx.glide('.table-tag');
    await ctx.sleep(2200);
  });

  await ctx.step('scroll', async () => {
    await ctx.glide('.rail');
    ctx.cue('moving');
    await ctx.mark('rail', '.rail');
    await ctx.tap(page.locator('.cat', { hasText: 'CHICKEN' }));
    await ctx.sleep(850);
    await ctx.tap(page.locator('.cat', { hasText: 'GRILLED' }));
    await ctx.sleep(400);
    await ctx.glide('.card .price');
    await ctx.wheel(160, 1200);
    await ctx.sleep(350);
    await ctx.wheel(-80, 700);
    await ctx.sleep(450);
  });

  await ctx.step('identity', async () => {
    await ctx.tap('.party');
    await page.getByRole('dialog', { name: 'Join this check' }).waitFor();
    await ctx.sleep(550);
    ctx.cue('typing');
    await ctx.mark('modal', '.identity-modal');
    await ctx.typeInto('.identity-modal input', 'Will');
    await ctx.sleep(450);
    await ctx.tap('.identity-modal .btn-primary');
    await page.locator('.party .label', { hasText: 'Ordering as Will' }).waitFor();
    await page.locator('.table-tag', { hasText: '1/10' }).waitFor();
    await ctx.sleep(2800);
  });

  await ctx.step('sheet', async () => {
    await page.locator('.grid-wrap').evaluate(el => el.scrollTo({ top: 0, behavior: 'instant' }));
    await ctx.sleep(250);
    const squid = page.locator('.card', { hasText: 'Grilled Squid' });
    await squid.scrollIntoViewIfNeeded();
    await ctx.tap(squid);
    await page.waitForSelector('.sheet .btn-add');
    await hideStripe(page);
    await ctx.sleep(700);
    ctx.cue('open');
    await page.locator('.btn-add', { hasText: '$20.99' }).waitFor();
    await ctx.mark('price', '.btn-add');
    await ctx.sleep(1100);
    await ctx.tap('.btn-add');
    await page.waitForSelector('.cartbar');
    await ctx.sleep(1300);
  });

  await ctx.step('cart', async () => {
    await ctx.tap('.cartbar');
    await page.waitForSelector('.line');
    await page.getByText('Pay at the end').waitFor();
    await ctx.sleep(450);
    await ctx.tap(page.getByRole('button', { name: /Add another person/ }));
    await page.getByRole('dialog', { name: 'Join this check' }).waitFor();
    await ctx.sleep(350);
    await ctx.typeInto('.identity-modal input', 'Jae');
    await ctx.sleep(350);
    await ctx.tap('.identity-modal .btn-primary');
    await page.getByText('2 on check').waitFor();
    await ctx.sleep(500);
    await ctx.tap(page.getByRole('button', { name: 'Add more' }));
    await page.waitForSelector('.card');
    await page.locator('.grid-wrap').evaluate(el => el.scrollTo({ top: 0, behavior: 'instant' }));
    await ctx.sleep(250);
    const beef = page.locator('.card', { hasText: 'Beef Bulgogi' });
    await beef.scrollIntoViewIfNeeded();
    await ctx.tap(beef);
    await page.waitForSelector('.sheet .btn-add');
    await hideStripe(page);
    await ctx.sleep(280);
    await ctx.tap('.btn-add');
    await page.waitForSelector('.cartbar');
    await ctx.sleep(400);
    await ctx.tap('.cartbar');
    await page.getByText('2 on check').waitFor();
    await page.locator('.line').nth(1).waitFor();
    ctx.cue('both');
    await ctx.mark('totals', '.bottombar');
    await ctx.sleep(1800);
  });

  await ctx.step('split', async () => {
    await ctx.tap(page.getByRole('button', { name: /Send round/ }));
    await page.waitForSelector('.sent-banner');
    await ctx.sleep(800);
    await ctx.tap(page.getByRole('button', { name: /Close out/ }));
    await page.waitForSelector('.receipt');
    await ctx.sleep(700);
    await ctx.tap(page.getByRole('tab', { name: 'Split by person' }));
    await page.waitForSelector('.shares');
    await ctx.sleep(550);
    await ctx.tap(page.getByRole('tab', { name: 'Evenly' }));
    ctx.cue('even');
    await ctx.sleep(400);
    await ctx.mark('shares', '.shares');
    await ctx.sleep(2200);
  });
}
