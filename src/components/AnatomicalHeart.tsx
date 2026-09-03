import React from 'react';
import {colors} from '../styles/theme';
import {
  AORTA,
  ARCH_BRANCHES,
  AV_GROOVE,
  HEART_VIEWBOX,
  IVC,
  IVC_WIDTH,
  IV_GROOVE,
  POINTS,
  PULMONARY_BRANCHES,
  PULMONARY_TRUNK,
  SILHOUETTE,
  SVC,
  SVC_WIDTH,
} from './heartGeometry';

/** Кривая сокращения: быстрая систола, более медленная диастола. */
export const beatCurve = (phase: number): number => {
  const p = phase % 1;
  if (p < 0.16) return Math.sin((p / 0.16) * Math.PI * 0.5); // систола
  if (p < 0.46) return Math.cos(((p - 0.16) / 0.3) * Math.PI * 0.5); // расслабление
  return 0;
};

type Props = {
  /** Фаза сердечного цикла 0..1. */
  beat?: number;
  /** Раскрытие полупрозрачного разреза правого предсердия, 0..1. */
  cutaway?: number;
  /** Свечение синусового узла, 0..1. */
  saGlow?: number;
  /** Показывать крупные сосуды. */
  showVessels?: boolean;
  /** Общая непрозрачность миокарда (для затемнения под схемами). */
  tissueOpacity?: number;
  /** Уникальный префикс для идентификаторов внутри SVG. */
  idPrefix: string;
  width?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/**
 * Анатомически узнаваемое сердце, вид спереди.
 * Полупрозрачный разрез правого предсердия открывает эндокард
 * и группу пейсмейкерных клеток синусового узла у устья верхней полой вены.
 */
export const AnatomicalHeart: React.FC<Props> = ({
  beat = 0,
  cutaway = 0,
  saGlow = 0,
  showVessels = true,
  tissueOpacity = 1,
  idPrefix,
  width = 760,
  style,
  children,
}) => {
  const contraction = beatCurve(beat);
  const scale = 1 - contraction * 0.035;
  const glowBoost = contraction * 0.25;

  const id = (name: string) => `${idPrefix}-${name}`;
  const height = width * (HEART_VIEWBOX.height / HEART_VIEWBOX.width);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${HEART_VIEWBOX.width} ${HEART_VIEWBOX.height}`}
      style={style}
    >
      <defs>
        <clipPath id={id('silhouette')}>
          <path d={SILHOUETTE} />
        </clipPath>
        <clipPath id={id('ra-window')}>
          <ellipse cx={152} cy={196} rx={104} ry={104} />
        </clipPath>
        <radialGradient id={id('myo')} cx="0.42" cy="0.34" r="0.78">
          <stop offset="0%" stopColor="#6B2A31" />
          <stop offset="62%" stopColor="#54222A" />
          <stop offset="100%" stopColor="#3A171D" />
        </radialGradient>
        <radialGradient id={id('sa-glow')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor={colors.brassLit} stopOpacity="0.85" />
          <stop offset="55%" stopColor={colors.brass} stopOpacity="0.28" />
          <stop offset="100%" stopColor={colors.brass} stopOpacity="0" />
        </radialGradient>
      </defs>

      <g
        transform={`translate(200 250) scale(${scale}) translate(-200 -250)`}
        opacity={tissueOpacity}
      >
        {showVessels ? (
          <g>
            {/* Полые вены — венозная сторона, срезаны круглым концом */}
            <path
              d={SVC}
              fill="none"
              stroke="#2C4149"
              strokeWidth={SVC_WIDTH}
              strokeLinecap="round"
            />
            <path
              d={IVC}
              fill="none"
              stroke="#2C4149"
              strokeWidth={IVC_WIDTH}
              strokeLinecap="round"
            />
            {/* Лёгочный ствол с бифуркацией */}
            <path
              d={PULMONARY_TRUNK}
              fill="none"
              stroke="#2B4048"
              strokeWidth={40}
              strokeLinecap="round"
            />
            {PULMONARY_BRANCHES.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#2B4048" strokeWidth={18} strokeLinecap="round" />
            ))}
            {/* Аорта и ветви дуги — артериальная сторона */}
            <path d={AORTA} fill="none" stroke="#43242A" strokeWidth={36} strokeLinecap="round" />
            {ARCH_BRANCHES.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#43242A" strokeWidth={13} strokeLinecap="round" />
            ))}
          </g>
        ) : null}

        {/* Миокард */}
        <path d={SILHOUETTE} fill={`url(#${id('myo')})`} />

        <g clipPath={`url(#${id('silhouette')})`}>
          {/* Объём камер: правые отделы тоньше, левый желудочек массивнее */}
          <ellipse cx={152} cy={190} rx={84} ry={78} fill="#5E2831" opacity={0.5} />
          <ellipse cx={288} cy={172} rx={84} ry={66} fill="#4A2028" opacity={0.45} />
          <ellipse cx={206} cy={322} rx={104} ry={108} fill="#6E2B30" opacity={0.5} />
          <ellipse
            cx={302}
            cy={322}
            rx={92}
            ry={118}
            fill="#7D3139"
            opacity={0.5 + glowBoost * 0.5}
          />

          {/* Борозды */}
          <path d={AV_GROOVE} fill="none" stroke="#2C1318" strokeWidth={7} strokeLinecap="round" />
          <path d={IV_GROOVE} fill="none" stroke="#2C1318" strokeWidth={6} strokeLinecap="round" />
          {/* Венечные сосуды в бороздах */}
          <path d={AV_GROOVE} fill="none" stroke="#8E4048" strokeWidth={2.4} opacity={0.55} />
          <path d={IV_GROOVE} fill="none" stroke="#8E4048" strokeWidth={2.2} opacity={0.5} />
          {/* Толщина стенки левого желудочка — он массивнее правого */}
          <path
            d="M262 268 C268 322, 264 380, 246 420"
            fill="none"
            stroke="#3A171D"
            strokeWidth={3}
            opacity={0.5}
          />
        </g>

        {/* Край миокарда: контур отделяет сердце от фона */}
        <path
          d={SILHOUETTE}
          fill="none"
          stroke="#95434B"
          strokeWidth={2.2}
          opacity={0.5 + glowBoost}
        />

        {/* Полупрозрачный разрез правого предсердия */}
        {cutaway > 0 ? (
          <g opacity={cutaway}>
            <g clipPath={`url(#${id('silhouette')})`}>
              <g clipPath={`url(#${id('ra-window')})`}>
                {/* Просвет камеры */}
                <rect x={0} y={0} width={400} height={470} fill="#180E12" opacity={0.94} />
                {/* Толщина стенки предсердия по срезу */}
                <path
                  d={SILHOUETTE}
                  fill="none"
                  stroke="#8A3A42"
                  strokeWidth={11}
                  opacity={0.9}
                />
                {/* Гребенчатые мышцы */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <path
                    key={i}
                    d={`M${120 + i * 5} ${172 + i * 17} C${150 + i * 4} ${168 + i * 18}, ${
                      176 + i * 3
                    } ${180 + i * 16}, ${192 + i * 2} ${196 + i * 15}`}
                    fill="none"
                    stroke={colors.milkDim}
                    strokeOpacity={0.16}
                    strokeWidth={1.7}
                  />
                ))}
                {/* Пограничный гребень — вдоль него лежит узел */}
                <path
                  d="M150 132 C136 168, 132 210, 140 250"
                  fill="none"
                  stroke={colors.milkDim}
                  strokeOpacity={0.3}
                  strokeWidth={2.6}
                />
              </g>
            </g>
            {/* Линия разреза */}
            <ellipse
              cx={152}
              cy={196}
              rx={104}
              ry={104}
              fill="none"
              stroke={colors.milkDim}
              strokeOpacity={0.28}
              strokeWidth={1.6}
              strokeDasharray="5 7"
              clipPath={`url(#${id('silhouette')})`}
            />
          </g>
        ) : null}

        {/* Синусовый узел: группа специализированных клеток, а не одна клетка */}
        {saGlow > 0 ? (
          <g opacity={saGlow}>
            <circle
              cx={POINTS.sinusNode.x}
              cy={POINTS.sinusNode.y}
              r={46}
              fill={`url(#${id('sa-glow')})`}
            />
            {SA_CELLS.map((c, i) => (
              <ellipse
                key={i}
                cx={POINTS.sinusNode.x + c.dx}
                cy={POINTS.sinusNode.y + c.dy}
                rx={c.rx}
                ry={c.ry}
                transform={`rotate(${c.rot} ${POINTS.sinusNode.x + c.dx} ${
                  POINTS.sinusNode.y + c.dy
                })`}
                fill={colors.brassLit}
                opacity={0.55 + 0.45 * saGlow}
              />
            ))}
          </g>
        ) : null}

        {children}
      </g>
    </svg>
  );
};

/**
 * Клетки синусового узла: небольшая вытянутая группа вдоль
 * пограничного гребня у устья верхней полой вены.
 */
export const SA_CELLS = [
  {dx: -8, dy: -14, rx: 5.2, ry: 2.6, rot: 108},
  {dx: 2, dy: -9, rx: 5.6, ry: 2.7, rot: 96},
  {dx: -6, dy: -2, rx: 5.4, ry: 2.6, rot: 100},
  {dx: 4, dy: 3, rx: 5.8, ry: 2.8, rot: 92},
  {dx: -5, dy: 10, rx: 5.2, ry: 2.6, rot: 104},
  {dx: 5, dy: 15, rx: 5, ry: 2.5, rot: 96},
  {dx: -2, dy: 22, rx: 4.6, ry: 2.4, rot: 100},
  {dx: 9, dy: -2, rx: 4.4, ry: 2.3, rot: 88},
  {dx: -12, dy: 5, rx: 4.4, ry: 2.3, rot: 106},
] as const;
