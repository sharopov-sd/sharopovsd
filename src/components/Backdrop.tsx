import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from '../styles/theme';

/**
 * Фон кадра: глубокий графит, мягкая виньетка и лёгкое плёночное зерно.
 * Зерно детерминировано: seed зависит только от номера кадра.
 */
export const Backdrop: React.FC<{
  /** Смещение оттенка фона: 0 — нейтральный графит, 1 — чуть теплее. */
  warmth?: number;
}> = ({warmth = 0}) => {
  const frame = useCurrentFrame();
  // Зерно обновляется каждые 3 кадра — «плёночная», а не мерцающая фактура.
  const seed = Math.floor(frame / 3) % 7;

  return (
    <AbsoluteFill style={{backgroundColor: colors.ink}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(78% 52% at 50% 38%, ${
            warmth > 0 ? 'rgba(41,52,48,0.95)' : 'rgba(22,36,42,0.95)'
          } 0%, ${colors.ink} 58%, ${colors.inkDeep} 100%)`,
        }}
      />
      {/* Виньетка */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 68% at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      {/* Зерно */}
      <AbsoluteFill style={{opacity: 0.075, mixBlendMode: 'overlay'}}>
        <svg width="100%" height="100%" viewBox="0 0 540 960" preserveAspectRatio="none">
          <filter id={`grain-${seed}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves={3}
              seed={seed}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="540" height="960" filter={`url(#grain-${seed})`} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
