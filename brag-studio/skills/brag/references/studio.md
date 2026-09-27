# brag-studio capture path

Use this when the product has a live URL. The executable is `bin/brag-studio.mjs` at the root of this copy. Do not draw the product from memory when a recording can show it.

```bash
node brag-studio/bin/brag-studio.mjs \
  --url https://example.com/path \
  --journey path/to/journey.mjs \
  --format landscape \
  --disclaimers path/to/disclaimers.json \
  --out brag-studio/runs/name
```

## Capture

Chrome, headless, viewport 1920×1080, deviceScaleFactor 2. The journey drives the page: real scrolling, clicks, and typing. A cursor is drawn into the page because headless capture has no OS pointer. Frames come from a CDP screencast so the clip is footage, not a slideshow of screenshots.

`prepare(page)` may stub a mutating request. Say so in the plan. Do not press a control that takes payment or places a real order.

## Storyboard

`scenes` in the journey names the step, the on-screen words, and the length. The checker rejects copy that invents metrics, customers, ratings, or integrations. A disclaimer from the JSON file is burned in for the whole video.

Words have to stay up long enough to read: about 0.8s for a short label, about 0.3s per word after that.

## Frame

Landscape puts the recorded UI in a device window and the explanation in the remaining space: a caption, a callout, a highlight box, and a slow zoom toward the marked element. Vertical and square use the same pieces, restacked. The end card may hold one frame of the recording. Other scenes stay in motion.

## Review

After the render, the command writes a one-frame-per-second contact sheet and checks for cut-off type, overlapping boxes, blank frames, and pixels on the outer edge. Fix the layout and run again. `--reuse` rebuilds the edit without another capture.

## Audio

Music is generated in the pipeline. Sound effects are the CC0 Kenney files in `assets/sfx/`. Do not use the bundled ende.app tracks unless their license is confirmed. Voiceover stays off unless the invocation asks for it.
