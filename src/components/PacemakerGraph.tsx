import React from 'react';
import {colors, fonts} from '../styles/theme';
import {APConfig, APSample, cycleMs, sampleAP} from '../data/pacemaker';

/** Цветовой код токов: кальций — тёплый, калий — холодный. */
export const PHASE_COLORS: Record<number, string> = {
  4: colors.brass,
  0: colors.brassLit,
  3: colors.tealLit,
};

type Props = {
  cfg: APConfig;
  /** Сколько циклов уместить по оси времени (если не задано окно). */
  cycles?: number;
  /**
   * Жёсткое окно времени в мс. Позволяет сравнивать два режима
   * на одной временной шкале: при более крутой фазе 4 в то же окно
   * укладывается больше потенциалов действия.
   */
  windowMs?: number;
  /** Доля построенной кривой, 0..1. */
  progress: number;
  width: number;
  height: number;
  /** Подписи осей и уровней. */
  showAxisLabels?: boolean;
  /** Подсветка порога. */
  thresholdGlow?: number;
  /** Цвет кривой; по умолчанию — по фазам. */
  strokeOverride?: string;
  /** Показать «перо» на конце кривой. */
  showPen?: boolean;
  /** Прямая, показывающая наклон фазы 4. */
  slopeHint?: string;
  style?: React.CSSProperties;
};

const V_MIN = -75;
const V_MAX = 22;

/**
 * График мембранного потенциала пейсмейкерной клетки.
 * Линия не остаётся горизонтальной: в фазе 4 она сама поднимается к порогу.
 */
export const PacemakerGraph: React.FC<Props> = ({
  cfg,
  cycles = 1,
  windowMs,
  progress,
  width,
  height,
  showAxisLabels = true,
  thresholdGlow = 0,
  strokeOverride,
  showPen = true,
  slopeHint,
  style,
}) => {
  const padLeft = showAxisLabels ? 96 : 26;
  const padRight = 22;
  const padTop = 26;
  const padBottom = 34;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const totalMs = windowMs ?? cycleMs(cfg) * cycles;
  const sampledCycles = Math.ceil(totalMs / cycleMs(cfg)) + 1;
  const samples = sampleAP(cfg, sampledCycles, 3).filter((s) => s.t <= totalMs);

  const x = (t: number) => padLeft + (t / totalMs) * plotW;
  const y = (v: number) => padTop + ((V_MAX - v) / (V_MAX - V_MIN)) * plotH;

  const tMax = totalMs * Math.max(0, Math.min(1, progress));
  const visible = samples.filter((s) => s.t <= tMax);

  // Разбиваем видимую часть на отрезки по фазам, чтобы каждая фаза
  // была окрашена своим током.
  const runs: {phase: number; pts: APSample[]}[] = [];
  for (const s of visible) {
    const last = runs[runs.length - 1];
    if (!last || last.phase !== s.phase) {
      if (last) last.pts.push(s); // стык без разрыва
      runs.push({phase: s.phase, pts: [s]});
    } else {
      last.pts.push(s);
    }
  }

  const head = visible[visible.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={style}>
      {/* Сетка */}
      <g opacity={0.5}>
        {[0, 1, 2, 3, 4].map((i) => {
          const gy = padTop + (plotH / 4) * i;
          return (
            <line
              key={i}
              x1={padLeft}
              y1={gy}
              x2={padLeft + plotW}
              y2={gy}
              stroke={colors.greyDim}
              strokeWidth={1}
              opacity={0.45}
            />
          );
        })}
      </g>

      {/* Ось потенциала */}
      <line
        x1={padLeft}
        y1={padTop}
        x2={padLeft}
        y2={padTop + plotH}
        stroke={colors.grey}
        strokeWidth={1.6}
      />
      <line
        x1={padLeft}
        y1={y(V_MIN + 2)}
        x2={padLeft + plotW}
        y2={y(V_MIN + 2)}
        stroke={colors.grey}
        strokeWidth={1.2}
        opacity={0.5}
      />

      {/* Уровень максимального диастолического потенциала */}
      <line
        x1={padLeft}
        y1={y(cfg.mdp)}
        x2={padLeft + plotW}
        y2={y(cfg.mdp)}
        stroke={colors.grey}
        strokeWidth={1.4}
        strokeDasharray="6 8"
        opacity={0.55}
      />

      {/* Порог возбуждения */}
      <line
        x1={padLeft}
        y1={y(cfg.threshold)}
        x2={padLeft + plotW}
        y2={y(cfg.threshold)}
        stroke={colors.brass}
        strokeWidth={1.8 + thresholdGlow * 1.4}
        strokeDasharray="10 8"
        opacity={0.5 + thresholdGlow * 0.5}
        style={
          thresholdGlow > 0
            ? {filter: `drop-shadow(0 0 ${6 * thresholdGlow}px rgba(176,141,63,0.8))`}
            : undefined
        }
      />

      {showAxisLabels ? (
        <g fontFamily={fonts.mono} fontSize={19} fill={colors.grey}>
          <text x={padLeft - 12} y={y(cfg.peak) + 6} textAnchor="end">
            {cfg.peak > 0 ? `+${cfg.peak}` : cfg.peak}
          </text>
          <text x={padLeft - 12} y={y(cfg.threshold) + 6} textAnchor="end" fill={colors.brass}>
            {cfg.threshold}
          </text>
          <text x={padLeft - 12} y={y(cfg.mdp) + 6} textAnchor="end">
            {cfg.mdp}
          </text>
          <text x={padLeft - 12} y={padTop + 4} textAnchor="end" fill={colors.greyDim}>
            мВ
          </text>
        </g>
      ) : null}

      {/* Наклон фазы 4 — то, что меняет вегетативная система */}
      {slopeHint && progress > 0.04 ? (
        <line
          x1={x(0)}
          y1={y(cfg.mdp)}
          x2={x(Math.min(cfg.phase4, totalMs))}
          y2={y(cfg.threshold)}
          stroke={slopeHint}
          strokeWidth={2.4}
          strokeDasharray="7 7"
          opacity={0.75}
        />
      ) : null}

      {/* Кривая по фазам */}
      {runs.map((run, i) => (
        <polyline
          key={i}
          points={run.pts.map((p) => `${x(p.t)},${y(p.v)}`).join(' ')}
          fill="none"
          stroke={strokeOverride ?? PHASE_COLORS[run.phase]}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{filter: 'drop-shadow(0 0 8px rgba(176,141,63,0.35))'}}
        />
      ))}

      {/* Перо: текущая точка потенциала */}
      {showPen && head ? (
        <g>
          <circle
            cx={x(head.t)}
            cy={y(head.v)}
            r={9}
            fill={strokeOverride ?? PHASE_COLORS[head.phase]}
            opacity={0.22}
          />
          <circle
            cx={x(head.t)}
            cy={y(head.v)}
            r={5}
            fill={colors.milk}
            style={{filter: 'drop-shadow(0 0 9px rgba(243,236,223,0.85))'}}
          />
        </g>
      ) : null}
    </svg>
  );
};
