/** Landscape-first frame. The recorded UI sits in a device window; type uses the rest. */

export const FORMATS = {
  landscape: { width: 1920, height: 1080 },
  vertical: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 }
};

const PHONE_ASPECT = 390 / 844;

export function layoutFor(format, { fontScale = 1, margin } = {}) {
  const base = FORMATS[format];
  if (!base) throw new Error(`Unknown format "${format}". Use landscape, vertical, or square.`);
  const m = margin ?? (format === 'landscape' ? 72 : 56);
  if (format === 'landscape') {
    const phoneH = 920;
    const phoneW = Math.round(phoneH * PHONE_ASPECT);
    return {
      format, ...base, margin: m, fontScale,
      phone: { x: base.width - m - phoneW, y: Math.round((base.height - phoneH) / 2), w: phoneW, h: phoneH },
      textWidth: 640,
      endTop: 268,
      hookSize: 92,
      titleSize: 58,
      endSize: 104,
      subSize: 24
    };
  }
  if (format === 'vertical') {
    const phoneW = 620;
    const phoneH = Math.round(phoneW / PHONE_ASPECT);
    const x = Math.round((base.width - phoneW) / 2);
    return {
      format, ...base, margin: m, fontScale,
      phone: { x, y: m, w: phoneW, h: phoneH },
      textWidth: base.width - m * 2,
      endTop: null,
      hookSize: 72,
      titleSize: 48,
      endSize: 84,
      subSize: 22,
      textTop: m + phoneH + 36
    };
  }
  const phoneH = 860;
  const phoneW = Math.round(phoneH * PHONE_ASPECT);
  return {
    format, ...base, margin: m, fontScale,
    phone: { x: base.width - m - phoneW, y: Math.round((base.height - phoneH) / 2), w: phoneW, h: phoneH },
    textWidth: 460,
    endTop: 220,
    hookSize: 64,
    titleSize: 40,
    endSize: 72,
    subSize: 20
  };
}

export function rectsOverlap(a, b, slack = 2) {
  return a.x < b.x + b.w - slack && a.x + a.w > b.x + slack && a.y < b.y + b.h - slack && a.y + a.h > b.y + slack;
}

export function auditLayout(layout) {
  const issues = [];
  const p = layout.phone;
  const m = layout.margin;
  if (p.x < m || p.y < m || p.x + p.w > layout.width - m || p.y + p.h > layout.height - m) {
    issues.push({ type: 'cutoff', id: 'phone' });
  }
  return issues;
}

export function auditBoxes(samples, layout) {
  const { width, height, margin, phone } = layout;
  const issues = [];
  for (const sample of samples) {
    const vis = (sample.boxes || []).filter(b => b.opacity >= 0.55 && b.w > 2 && b.h > 2);
    for (const b of vis) {
      const cut =
        b.x < margin - 1 ||
        b.y < margin - 1 ||
        b.x + b.w > width - margin + 1 ||
        b.y + b.h > height - margin + 1;
      if (cut) issues.push({ type: 'cutoff', id: b.id, t: sample.t, box: roundBox(b) });
      if (phone && rectsOverlap(b, phone)) issues.push({ type: 'overlap', a: b.id, b: 'phone', t: sample.t });
    }
    for (let i = 0; i < vis.length; i++) {
      for (let j = i + 1; j < vis.length; j++) {
        if (rectsOverlap(vis[i], vis[j])) {
          issues.push({ type: 'overlap', a: vis[i].id, b: vis[j].id, t: sample.t });
        }
      }
    }
  }
  return issues;
}

function roundBox(b) {
  return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.w), h: Math.round(b.h) };
}
