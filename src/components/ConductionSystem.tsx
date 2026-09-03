import React from 'react';
import {interpolate} from 'remotion';
import {colors} from '../styles/theme';
import {
  ATRIAL_SPREAD,
  LEFT_BUNDLE,
  MAIN_PATH,
  POINTS,
  PURKINJE,
  RIGHT_BUNDLE,
} from './heartGeometry';

/**
 * Хронология проведения импульса, доли от общего прогресса сцены.
 * Пауза в атриовентрикулярном узле — физиологическая задержка,
 * во время которой предсердия успевают докачать кровь в желудочки.
 */
export const CONDUCTION_STAGES = {
  saFire: [0, 0.08],
  atria: [0.08, 0.34],
  avDelay: [0.34, 0.56],
  his: [0.56, 0.68],
  bundles: [0.68, 0.82],
  purkinje: [0.82, 1.0],
} as const;

const seg = (progress: number, [a, b]: readonly [number, number]) =>
  interpolate(progress, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const Trace: React.FC<{
  d: string;
  reveal: number;
  color: string;
  width: number;
  glow?: boolean;
  opacity?: number;
}> = ({d, reveal, color, width, glow = false, opacity = 1}) => {
  if (reveal <= 0) return null;
  return (
    <>
      <path
        d={d}
        pathLength={1}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray="1 1"
        strokeDashoffset={1 - reveal}
        opacity={opacity}
        style={glow ? {filter: `drop-shadow(0 0 7px ${color})`} : undefined}
      />
      {/* Светящийся фронт возбуждения */}
      {reveal < 1 ? (
        <path
          d={d}
          pathLength={1}
          fill="none"
          stroke={colors.brassLit}
          strokeWidth={width * 1.7}
          strokeLinecap="round"
          strokeDasharray="0.045 1"
          strokeDashoffset={-(reveal - 0.045)}
          style={{filter: 'drop-shadow(0 0 10px rgba(231,196,117,0.9))'}}
        />
      ) : null}
    </>
  );
};

/**
 * Проводящая система сердца: синусовый узел → миокард предсердий →
 * атриовентрикулярный узел → пучок Гиса → ножки → волокна Пуркинье.
 *
 * Компонент рассчитан на вставку внутрь AnatomicalHeart (общий viewBox).
 */
export const ConductionSystem: React.FC<{
  /** Прогресс одного проведения, 0..1. */
  progress: number;
  /** Показывать статичную «схему» путей даже до прохождения импульса. */
  showSkeleton?: boolean;
}> = ({progress, showSkeleton = true}) => {
  const atria = seg(progress, CONDUCTION_STAGES.atria);
  const avDelay = seg(progress, CONDUCTION_STAGES.avDelay);
  const his = seg(progress, CONDUCTION_STAGES.his);
  const bundles = seg(progress, CONDUCTION_STAGES.bundles);
  const purkinje = seg(progress, CONDUCTION_STAGES.purkinje);
  const saFire = seg(progress, CONDUCTION_STAGES.saFire);

  // Пульсация узла во время задержки: импульс «ждёт» в АВ-узле.
  const avPulse = avDelay > 0 && avDelay < 1 ? 0.55 + 0.45 * Math.sin(avDelay * Math.PI * 3) : 0;

  return (
    <g>
      {showSkeleton ? (
        <g opacity={0.32}>
          {ATRIAL_SPREAD.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={colors.greyDim} strokeWidth={2} />
          ))}
          <path d={MAIN_PATH} fill="none" stroke={colors.greyDim} strokeWidth={2.6} />
          <path d={RIGHT_BUNDLE} fill="none" stroke={colors.greyDim} strokeWidth={2.4} />
          <path d={LEFT_BUNDLE} fill="none" stroke={colors.greyDim} strokeWidth={2.4} />
          {PURKINJE.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={colors.greyDim} strokeWidth={1.8} />
          ))}
        </g>
      ) : null}

      {/* Возбуждение предсердий — веером от синусового узла */}
      {ATRIAL_SPREAD.map((d, i) => (
        <Trace
          key={i}
          d={d}
          reveal={Math.max(0, Math.min(1, atria * 1.15 - i * 0.03))}
          color={colors.brass}
          width={2.6}
        />
      ))}

      {/* Проведение к атриовентрикулярному узлу */}
      <Trace d={MAIN_PATH} reveal={Math.min(atria, 0.55)} color={colors.brass} width={3.2} />

      {/* Пучок Гиса и ножки */}
      <Trace d={MAIN_PATH} reveal={his} color={colors.brassLit} width={3.4} glow />
      <Trace d={RIGHT_BUNDLE} reveal={bundles} color={colors.brassLit} width={3} glow />
      <Trace d={LEFT_BUNDLE} reveal={bundles} color={colors.brassLit} width={3} glow />

      {/* Волокна Пуркинье */}
      {PURKINJE.map((d, i) => (
        <Trace
          key={i}
          d={d}
          reveal={Math.max(0, Math.min(1, purkinje * 1.3 - (i % 3) * 0.08))}
          color={colors.brassLit}
          width={2.2}
          glow
        />
      ))}

      {/* Ответ миокарда желудочков на приход возбуждения */}
      {purkinje > 0.25 ? (
        <ellipse
          cx={258}
          cy={340}
          rx={110}
          ry={116}
          fill={colors.oxbloodLit}
          opacity={0.16 * Math.min(1, purkinje * 1.6)}
        />
      ) : null}

      {/* Синусовый узел: вспышка в начале цикла */}
      <circle
        cx={POINTS.sinusNode.x}
        cy={POINTS.sinusNode.y}
        r={9 + saFire * 5}
        fill={colors.brassLit}
        opacity={0.55 + 0.45 * saFire}
        style={{filter: 'drop-shadow(0 0 12px rgba(231,196,117,0.85))'}}
      />

      {/* Атриовентрикулярный узел: физиологическая задержка */}
      <circle
        cx={POINTS.avNode.x}
        cy={POINTS.avNode.y}
        r={7 + avPulse * 3.5}
        fill={avDelay > 0 ? colors.brassLit : colors.greyDim}
        opacity={avDelay > 0 ? 0.5 + avPulse * 0.5 : 0.55}
        style={
          avDelay > 0 ? {filter: `drop-shadow(0 0 ${8 + avPulse * 8}px rgba(231,196,117,0.8))`} : undefined
        }
      />
    </g>
  );
};
