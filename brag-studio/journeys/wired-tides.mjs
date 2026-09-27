/**
 * Wired Tides agency site, recorded on the live homepage.
 * Scroll the design, open the inquiry page, then visit privacy and terms.
 * The contact control opens the visitor's mail app. This journey never activates it.
 */

export const product = 'Wired Tides';
export const device = 'laptop';
export const frame = 'viewport';
export const viewport = { width: 1366, height: 768 };
export const cursor = {
  fill: 'rgba(21, 61, 237, 0.92)',
  down: '#9eb6ff',
  ring: 'rgba(158, 182, 255, .95)'
};
export const theme = {
  bg: '#0c1a29',
  ink: '#f4f7fb',
  inkSoft: '#d5def2',
  kicker: '#9eb6ff',
  hot: '#153ded',
  display: 'Wired Sans',
  displayWeight: 700,
  glow: '21,61,237',
  glow2: '158,182,255'
};

export const notes = `
Wired Tides is Yael Sahagun's AI automation agency site, and the first proof of the process it sells. Yael Sahagun supplied the design. His AI operator prepared the build, created the GitHub repo and the Vercel project, added Contact, Privacy, and Terms pages, wired the inquiry links, diagnosed a DNS and certificate issue, and issued the certificates. Yael Sahagun bought the domain and edited DNS. This recording is the live site: the homepage, the inquiry links, and Contact, Privacy, and Terms. The mail link is only hovered.
`;

export const posts = {
  linkedin: `Wired Tides is Yael Sahagun's AI automation agency, and the first proof of the process it sells.

He supplied the design. His AI operator prepared the build, created the GitHub repo and the Vercel project, added Contact, Privacy, and Terms, wired the inquiry links, and issued the certificate.

Yael Sahagun bought the domain and edited DNS.`,
  x: `Designed by Yael Sahagun. Built and deployed by his AI operator.

Wired Tides: the agency site, with contact, privacy, and terms. He bought the domain and edited DNS. The operator handled the repo, Vercel, and the certificate.`
};

const pace = { maxRate: 1.4, minRate: 0.82 };

export const scenes = [
  {
    id: 'hook',
    kind: 'hook',
    step: 'arrive',
    duration: 3.6,
    ...pace,
    cue: 'settled',
    cueAt: 0.24,
    zoom: [1, 1.015],
    dim: 0,
    copy: {
      kicker: 'Wired Tides',
      words: ['Designed.', 'Built.', 'Live.'],
      sub: 'From a design to a live site.'
    }
  },
  {
    id: 'scroll',
    kind: 'feature',
    step: 'scroll',
    duration: 5.2,
    ...pace,
    cue: 'moving',
    cueAt: 0.12,
    zoom: [1, 1.02],
    copy: {
      kicker: 'Design',
      title: 'Yael supplied the design',
      sub: 'The agency site uses his design.'
    }
  },
  {
    id: 'cta',
    kind: 'feature',
    step: 'cta',
    duration: 4.8,
    ...pace,
    cue: 'opened',
    cueAt: 0.48,
    zoom: [1, 1.02],
    copy: {
      kicker: 'Inquiry',
      title: 'The path to a conversation',
      sub: 'Those links open the contact page.',
      callout: 'Contact'
    }
  },
  {
    id: 'pages',
    kind: 'feature',
    step: 'pages',
    duration: 5.6,
    ...pace,
    cue: 'terms',
    cueAt: 0.58,
    zoom: [1, 1.015],
    copy: {
      kicker: 'Pages',
      title: 'Contact, privacy, and terms',
      sub: 'The operator added these pages.',
      callout: 'Three pages'
    }
  },
  {
    id: 'ship',
    kind: 'feature',
    step: 'ship',
    duration: 3.5,
    ...pace,
    cue: 'home',
    cueAt: 0.32,
    zoom: [1, 1.015],
    copy: {
      kicker: 'Deployed',
      title: 'Shipped by the operator',
      sub: 'He bought the domain and edited DNS.',
      callout: 'Certificate'
    }
  },
  {
    id: 'end',
    kind: 'end',
    duration: 4.0,
    holdScene: 'hook',
    dim: 0.4,
    zoom: [1, 1],
    copy: {
      kicker: 'Live',
      title: 'Wired Tides',
      sub: 'Designed by Yael Sahagun. Built and deployed by his operator.'
    }
  }
];

const GUTTER = { x: 22, y: 420 };
const TOP = 8;

async function approach(ctx, locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Link is not visible');
  const y = box.y + box.height / 2;
  await ctx.jump(Math.max(8, box.x - 28), y);
  await ctx.tap(locator);
}

export async function run(ctx) {
  const { page } = ctx;
  const talk = () => page.getByRole('link', { name: /^Let.s talk$/ }).first();
  const heroTalk = () => page.getByRole('link', { name: /Let.s talk possibilities/ }).first();
  const mail = () => page.getByRole('link', { name: /Open your email app/ }).first();

  await ctx.jump(GUTTER.x, GUTTER.y);

  await ctx.step('arrive', async () => {
    await page.getByRole('heading', { level: 1, name: /Your business/ }).waitFor();
    await ctx.sleep(700);
    ctx.cue('settled');
    await ctx.sleep(2800);
  });

  await ctx.step('scroll', async () => {
    await ctx.rest(GUTTER.x, GUTTER.y);
    ctx.cue('moving');
    await ctx.wheel(640, 1300);
    await ctx.sleep(280);
    await ctx.wheel(780, 1500);
    await ctx.sleep(360);
    await ctx.wheel(720, 1400);
    await ctx.sleep(500);
  });

  await ctx.step('cta', async () => {
    await ctx.wheel(-1100, 1100);
    await ctx.wheel(-1100, 1000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await ctx.sleep(350);
    const hero = heroTalk();
    await hero.waitFor();
    const box = await hero.boundingBox();
    await ctx.rest(GUTTER.x, box.y + box.height / 2);
    await ctx.glide(hero);
    await ctx.sleep(700);
    await ctx.rest(GUTTER.x, TOP);
    await ctx.rest(1180, TOP);
    await ctx.tap(talk());
    await page.getByRole('heading', { level: 1, name: 'Contact' }).waitFor();
    ctx.cue('opened');
    await ctx.jump(GUTTER.x, 320);
    await ctx.sleep(450);
    const email = mail();
    await email.scrollIntoViewIfNeeded();
    const mailBox = await email.boundingBox();
    await ctx.jump(Math.max(8, mailBox.x - 28), mailBox.y + mailBox.height / 2);
    await ctx.glide(email);
    await ctx.sleep(550);
    await ctx.jump(GUTTER.x, 320);
    await ctx.sleep(800);
  });

  await ctx.step('pages', async () => {
    const privacy = page.getByRole('link', { name: 'Privacy Policy' }).first();
    await privacy.scrollIntoViewIfNeeded();
    await ctx.sleep(200);
    await approach(ctx, privacy);
    await page.getByRole('heading', { level: 1, name: 'Privacy Policy' }).waitFor();
    await ctx.jump(GUTTER.x, 280);
    await ctx.sleep(1400);
    await ctx.wheel(240, 600);
    await ctx.sleep(300);
    const terms = page.getByRole('link', { name: /Terms/ }).first();
    await terms.scrollIntoViewIfNeeded();
    await approach(ctx, terms);
    await page.getByRole('heading', { level: 1, name: /Terms/ }).waitFor();
    ctx.cue('terms');
    await ctx.jump(GUTTER.x, 280);
    await ctx.sleep(1600);
  });

  await ctx.step('ship', async () => {
    const home = page.locator('a[href="/"], a[href="/#top"]').first();
    await ctx.jump(GUTTER.x, TOP);
    await ctx.tap(home);
    await page.getByRole('heading', { level: 1, name: /Your business/ }).waitFor();
    ctx.cue('home');
    await ctx.jump(GUTTER.x, GUTTER.y);
    await ctx.sleep(3600);
  });
}
