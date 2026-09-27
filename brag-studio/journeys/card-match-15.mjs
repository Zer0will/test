/**
 * Fifteen-second cut of the same Card Match capture.
 * Survey answers, then the result the live site returned.
 */
export {
  product,
  device,
  frame,
  viewport,
  cursor,
  theme,
  notes,
  posts,
  run
} from './card-match.mjs';

export const durationRange = { min: 14.5, max: 15.5 };

export const scenes = [
  {
    id: 'survey',
    kind: 'feature',
    step: 'survey',
    duration: 6.8,
    maxRate: 4.2,
    minRate: 0.8,
    cue: 'asking',
    cueAt: 0.08,
    zoom: [1, 1.012],
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
    duration: 5.2,
    maxRate: 1.4,
    minRate: 0.8,
    cue: 'shown',
    cueAt: 0.22,
    zoom: [1, 1.015],
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
    duration: 3.0,
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
