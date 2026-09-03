import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {colors} from '../styles/theme';

const NOISE_TILE = 160;

/**
 * Фон кадра: глубокий графит, мягкая виньетка и лёгкое плёночное зерно.
 *
 * Зерно — заранее сгенерированный тайл (scripts/build-noise.mjs), а не
 * фильтр feTurbulence: полнокадровый SVG-фильтр пересчитывался на каждом
 * кадре и в headless-рендере стоил больше, чем вся остальная сцена.
 * Смещение тайла зависит только от номера кадра, поэтому зерно «живое»,
 * но результат остаётся покадрово воспроизводимым.
 */
export const Backdrop: React.FC<{
  /** Смещение оттенка фона: 0 — нейтральный графит, 1 — чуть теплее. */
  warmth?: number;
}> = ({warmth = 0}) => {
  const frame = useCurrentFrame();
  // Тайл сдвигается раз в два кадра — плёночная, а не мерцающая фактура.
  const step = Math.floor(frame / 2);
  const offsetX = (step * 37) % NOISE_TILE;
  const offsetY = (step * 53) % NOISE_TILE;

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
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile('assets/noise.png')})`,
          backgroundRepeat: 'repeat',
          backgroundSize: `${NOISE_TILE}px ${NOISE_TILE}px`,
          backgroundPosition: `${offsetX}px ${offsetY}px`,
          opacity: 0.055,
        }}
      />
    </AbsoluteFill>
  );
};
