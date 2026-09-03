import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts, layout, type} from '../styles/theme';
import {HANDLE, RECORD_CODE} from '../data/character';
import {BEAT_FRAMES} from '../data/timeline';

/**
 * Знак Канона: вертикальная линия «пустого поля» и один зубец,
 * читающийся одновременно как комплекс QRS и как штрих пера.
 */
export const CanonMark: React.FC<{size?: number; color?: string; glow?: number}> = ({
  size = 34,
  color = colors.brass,
  glow = 0,
}) => (
  <svg
    width={size * 0.72}
    height={size}
    viewBox="0 0 26 36"
    style={{
      display: 'block',
      filter: glow > 0 ? `drop-shadow(0 0 ${8 * glow}px rgba(231,196,117,${0.6 * glow}))` : undefined,
    }}
  >
    <line x1="4" y1="2" x2="4" y2="34" stroke={color} strokeWidth={2.6} />
    <path
      d="M4 21 L11 21 L14.5 8 L18 30 L23 21"
      fill="none"
      stroke={color}
      strokeWidth={2.6}
      strokeLinejoin="miter"
      strokeLinecap="square"
    />
  </svg>
);

/**
 * Постоянная выходная полоса ролика: знак, хэндл и код записи.
 * Держится в безопасной зоне и не перетягивает внимание —
 * пульсирует ровно настолько, чтобы читаться как «живая» запись архива.
 */
export const BrandMark: React.FC = () => {
  const frame = useCurrentFrame();
  const beat = (frame % BEAT_FRAMES) / BEAT_FRAMES;
  const pulse = Math.exp(-Math.pow((beat - 0.05) * 7, 2));
  const appear = interpolate(frame, [6, 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: layout.brandY,
        left: layout.safeSide,
        right: layout.safeSide,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: appear * 0.86,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <CanonMark size={36} glow={0.25 + pulse * 0.75} />
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: type.micro,
            letterSpacing: '0.14em',
            color: colors.milkDim,
          }}
        >
          {HANDLE}
        </span>
      </div>
      <span
        style={{
          fontFamily: fonts.mono,
          fontSize: type.tiny,
          letterSpacing: '0.16em',
          color: colors.grey,
        }}
      >
        {RECORD_CODE}
      </span>
    </div>
  );
};
