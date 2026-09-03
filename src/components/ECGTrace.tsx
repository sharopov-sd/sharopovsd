import React from 'react';
import {colors, fonts} from '../styles/theme';

/** Длительность одного сердечного цикла на схематичной ЭКГ, мс. */
export const ECG_CYCLE_MS = 900;

/**
 * Схематичная кривая ЭКГ: зубец P (деполяризация миокарда предсердий),
 * интервал PQ (проведение через атриовентрикулярный узел),
 * комплекс QRS (деполяризация желудочков) и зубец T (реполяризация).
 * Амплитуды условные, в долях от высоты R.
 */
export const ecgAt = (tInCycle: number): number => {
  const t = tInCycle;
  if (t < 90) {
    // Зубец P
    return 0.14 * Math.pow(Math.sin((Math.PI * t) / 90), 2);
  }
  if (t < 165) return 0; // сегмент PQ — задержка в АВ-узле
  if (t < 180) return -0.07 * Math.sin((Math.PI * (t - 165)) / 15); // Q
  if (t < 205) return Math.sin((Math.PI * (t - 180)) / 50); // R
  if (t < 232) return -0.2 * Math.sin((Math.PI * (t - 205)) / 27); // S
  if (t < 330) return 0; // сегмент ST
  if (t < 500) return 0.22 * Math.pow(Math.sin((Math.PI * (t - 330)) / 170), 2); // T
  return 0;
};

type Props = {
  /** Сколько циклов помещается в кадре. */
  cycles: number;
  /** Доля построенной кривой, 0..1. */
  progress: number;
  width: number;
  height: number;
  /** Подписать P и QRS. */
  labels?: boolean;
  /** Подсветить зубец P. */
  highlightP?: number;
  /** Подсветить комплекс QRS. */
  highlightQRS?: number;
  style?: React.CSSProperties;
};

/** Схематичная электрокардиограмма, синхронная с проведением импульса. */
export const ECGTrace: React.FC<Props> = ({
  cycles,
  progress,
  width,
  height,
  labels = true,
  highlightP = 0,
  highlightQRS = 0,
  style,
}) => {
  const padX = 20;
  const baseline = height * 0.66;
  const amp = height * 0.42;
  const plotW = width - padX * 2;
  const totalMs = ECG_CYCLE_MS * cycles;

  const x = (t: number) => padX + (t / totalMs) * plotW;
  const y = (v: number) => baseline - v * amp;

  const step = 4;
  const tMax = totalMs * Math.max(0, Math.min(1, progress));
  const pts: string[] = [];
  for (let t = 0; t <= tMax; t += step) {
    pts.push(`${x(t).toFixed(1)},${y(ecgAt(t % ECG_CYCLE_MS)).toFixed(1)}`);
  }

  const headT = tMax;
  const headY = y(ecgAt(headT % ECG_CYCLE_MS));

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={style}>
      {/* Сетка ЭКГ — приглушённая, не спорит с кривой */}
      <g opacity={0.14}>
        {Array.from({length: Math.ceil(width / 26)}).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 26}
            y1={0}
            x2={i * 26}
            y2={height}
            stroke={colors.grey}
            strokeWidth={1}
          />
        ))}
        {Array.from({length: Math.ceil(height / 26)}).map((_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={i * 26}
            x2={width}
            y2={i * 26}
            stroke={colors.grey}
            strokeWidth={1}
          />
        ))}
      </g>

      {/* Изолиния */}
      <line
        x1={padX}
        y1={baseline}
        x2={width - padX}
        y2={baseline}
        stroke={colors.greyDim}
        strokeWidth={1.2}
        opacity={0.7}
      />

      {/* Подсветка зубца P и комплекса QRS */}
      {highlightP > 0 ? (
        <rect
          x={x(0)}
          y={y(0.3)}
          width={x(95) - x(0)}
          height={amp * 0.42}
          fill={colors.brass}
          opacity={0.16 * highlightP}
          rx={6}
        />
      ) : null}
      {highlightQRS > 0 ? (
        <rect
          x={x(160)}
          y={y(1.08)}
          width={x(240) - x(160)}
          height={amp * 1.34}
          fill={colors.brass}
          opacity={0.14 * highlightQRS}
          rx={6}
        />
      ) : null}

      {pts.length > 1 ? (
        <polyline
          points={pts.join(' ')}
          fill="none"
          stroke={colors.milk}
          strokeWidth={3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{filter: 'drop-shadow(0 0 7px rgba(243,236,223,0.35))'}}
        />
      ) : null}

      {progress > 0 && progress < 1 ? (
        <circle
          cx={x(headT)}
          cy={headY}
          r={5}
          fill={colors.brassLit}
          style={{filter: 'drop-shadow(0 0 10px rgba(231,196,117,0.9))'}}
        />
      ) : null}

      {labels ? (
        <g fontFamily={fonts.mono} fontSize={22} fill={colors.grey}>
          <text
            x={x(45)}
            y={y(0.34)}
            textAnchor="middle"
            fill={highlightP > 0.3 ? colors.brassLit : colors.grey}
            opacity={progress > 0.06 ? 1 : 0}
          >
            P
          </text>
          <text
            x={x(200)}
            y={y(1.12)}
            textAnchor="middle"
            fill={highlightQRS > 0.3 ? colors.brassLit : colors.grey}
            opacity={progress > 0.22 ? 1 : 0}
          >
            QRS
          </text>
        </g>
      ) : null}
    </svg>
  );
};
