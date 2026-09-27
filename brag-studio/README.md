# brag-studio

A capture-led version of [brag](https://github.com/latent-spaces/brag) by Shunit Haviv Hakimi. The original turns a project's source into a short launch video. This copy keeps that idea, then records the **live product** and cuts the video from that footage.

The upstream project is included here (skill, examples, Kenney sound effects, docs). Its README is [`UPSTREAM-README.md`](UPSTREAM-README.md). Its license is the MIT text in [`LICENSE`](LICENSE).

Upstream music tracks from ende.app are kept so this stays a copy of the public repo. Their license is not stated in that repo, so **brag-studio does not use them**. The video command writes an original music bed in code and uses the CC0 Kenney effects that shipped with brag ([Kenney](https://kenney.nl/), public domain).

## One command

From the repository root:

```bash
node brag-studio/bin/brag-studio.mjs \
  --url https://kochi-dine-in-app.vercel.app/table/7 \
  --journey brag-studio/journeys/kochi.mjs \
  --format landscape \
  --disclaimers brag-studio/projects/kochi/disclaimers.json \
  --out brag-studio/runs/kochi
```

| Flag | Meaning |
|---|---|
| `--url` | Live page to drive |
| `--journey` | Script that performs the journey and names each shot |
| `--format` | `landscape` (1920×1080), `vertical` (1080×1920), or `square` (1080×1080) |
| `--disclaimers` | JSON file. `disclaimers` is burned onto the video. The storyboard is rejected if it invents metrics, customers, or integrations. |
| `--out` | Run folder |
| `--reuse` | Rebuild the edit from the last capture |

Needs Node 22+, FFmpeg, and Google Chrome. Playwright is installed with `npm install` inside `brag-studio/` (the system Chrome is used; set `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` if you do not want a second browser).

```bash
cd brag-studio && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install && npm test
```

No voiceover is generated. No paid image, music, or video API is called.

## What the command does

1. **Record.** Headless Chrome at deviceScaleFactor 2 opens the URL and runs the journey at a human pace: scrolling, a drawn cursor, taps, and typing. The default viewport is 1920×1080. A journey can set its own. A CDP screencast stores the frames. `prepare()` on the journey may stub a request that would otherwise leave the machine.
2. **Storyboard.** Shot timings come from the recording plus the copy in the journey file. A checker rejects invented proof: customer counts, growth stats, ratings, and integrations that are not in the allow list.
3. **Landscape cut.** The recorded UI sits in a device window. On landscape, the caption column and that window are one centered group. A journey with `device: 'laptop'` uses a wider window for a desktop site. Type, callouts, and highlight boxes use the rest of the frame. Camera moves ease in. Screenshots are not the body of the video.
4. **Sound.** A generated bed, plus quiet Kenney clicks on the real taps.
5. **Review.** One frame a second becomes a contact sheet. The run checks cut-off type, overlapping boxes, blank frames, edge pixels, duration, size, and frame rate. It shrinks the type and re-renders if the layout audit fails.

## Journey script

`journeys/kochi.mjs` is the reference. Export:

- `run(ctx)` — `ctx.step`, `ctx.tap`, `ctx.glide`, `ctx.wheel`, `ctx.typeInto`, `ctx.cue`, `ctx.mark`
- `scenes` — which step to use, how long it plays, and the words on screen
- `posts` — `{ linkedin, x }`
- `prepare(page)` — optional Playwright hook before navigation

`ctx.mark(name, selector)` stores a box so the cut can draw a highlight on that element.

## Kochi

The checked-in journey records [Kochi table 7](https://kochi-dine-in-app.vercel.app/table/7): category tabs, joining the check, a dish, a second person, the shared cart, Send round to kitchen, then the split bill. It does not press Pay and does not type payment details. See `projects/kochi/disclaimers.json`. Dish photos in the app are stripe placeholders, so the cut stays on the category rail, the price button, and the cart.

## Wired Tides

`journeys/wired-tides.mjs` records the live agency site in a laptop window: the homepage, a scroll through the design, the inquiry links, then Contact, Privacy, and Terms. It does not send a message. See `projects/wired-tides/disclaimers.json`.

```bash
node brag-studio/bin/brag-studio.mjs \
  --url https://wiredtides.com \
  --journey brag-studio/journeys/wired-tides.mjs \
  --format landscape \
  --disclaimers brag-studio/projects/wired-tides/disclaimers.json \
  --out brag-studio/runs/wired-tides
```

## Credits

- Original workflow, skill, and CC0 interface effects: [latent-spaces/brag](https://github.com/latent-spaces/brag), MIT, Shunit Haviv Hakimi
- Effects: [Kenney](https://kenney.nl/)
- Motion is HTML rendered locally with headless Chrome and FFmpeg, the same idea as [Hyperframes](https://hyperframes.heygen.com/) without a hosted render
