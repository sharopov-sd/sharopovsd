import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts, layout, shadows, type} from '../styles/theme';
import {SCENE_FADE} from '../data/timeline';

/** Плавный вход и выход сцены — без резких склеек. */
export const useSceneFade = (durationInFrames: number): number => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, SCENE_FADE, durationInFrames - SCENE_FADE, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
};

/** Появление элемента с мягкой пружиной. */
export const useAppear = (delay: number, damping = 200): number => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, mass: 0.7}});
};

/** Рубричная надпись: моноширинная, разрядка, верхний регистр. */
export const SceneLabel: React.FC<{
  children: React.ReactNode;
  color?: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({children, color = colors.grey, size = type.micro, style}) => (
  <div
    style={{
      fontFamily: fonts.mono,
      fontSize: size,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Заголовок сцены. */
export const SceneTitle: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  align?: 'left' | 'center';
  style?: React.CSSProperties;
}> = ({children, size = type.h2, color = colors.milk, align = 'center', style}) => (
  <div
    style={{
      fontFamily: fonts.sans,
      fontWeight: 600,
      fontSize: size,
      lineHeight: 1.08,
      letterSpacing: '-0.015em',
      color,
      textAlign: align,
      textShadow: shadows.textDepth,
      textWrap: 'balance',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Реплика Авиценны — единственная антиква в проекте. */
export const VoiceLine: React.FC<{
  children: React.ReactNode;
  size?: number;
  style?: React.CSSProperties;
}> = ({children, size = type.h3, style}) => (
  <div
    style={{
      fontFamily: fonts.serif,
      fontSize: size,
      lineHeight: 1.3,
      color: colors.milk,
      textShadow: shadows.textDepth,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Подпись к анатомической структуре с выносной линией. */
export const Callout: React.FC<{
  x: number;
  y: number;
  /** Куда ведёт выносная линия (конец у структуры). */
  toX: number;
  toY: number;
  title: string;
  subtitle?: string;
  reveal: number;
  align?: 'left' | 'right';
  color?: string;
}> = ({x, y, toX, toY, title, subtitle, reveal, align = 'left', color = colors.brass}) => {
  if (reveal <= 0) return null;
  const lineLen = Math.hypot(toX - x, toY - y);
  return (
    <>
      <svg
        style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}
        width={layout.width}
        height={layout.height}
      >
        <line
          x1={x}
          y1={y}
          x2={toX}
          y2={toY}
          pathLength={1}
          stroke={color}
          strokeWidth={1.6}
          strokeDasharray="1 1"
          strokeDashoffset={1 - reveal}
          opacity={0.75}
        />
        <circle cx={toX} cy={toY} r={4.5} fill={color} opacity={reveal} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: align === 'left' ? x : undefined,
          right: align === 'right' ? layout.width - x : undefined,
          top: y - 62,
          opacity: interpolate(reveal, [0.45, 1], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          textAlign: align,
          maxWidth: Math.max(260, lineLen + 220),
        }}
      >
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 600,
            fontSize: type.h3,
            color: colors.milk,
            letterSpacing: '-0.01em',
            textShadow: shadows.textDepth,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: type.micro,
              letterSpacing: '0.1em',
              color,
              marginTop: 6,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </>
  );
};

/** Область сцены между верхней служебной полосой и субтитрами. */
export const Stage: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({
  children,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: layout.stageTop,
      height: layout.stageBottom - layout.stageTop,
      ...style,
    }}
  >
    {children}
  </div>
);
