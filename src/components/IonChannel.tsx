import React from 'react';
import {colors, fonts} from '../styles/theme';

const W = 300;
const H = 300;
const MEMBRANE_TOP = 96;
const MEMBRANE_BOTTOM = 150;
const PORE_LEFT = 130;
const PORE_RIGHT = 170;

type Direction = 'in' | 'out' | 'mixed';

type Props = {
  /** Обозначение тока: Iᶠ, I(Ca,T), I(Ca,L), I(K). */
  title: string;
  /** Пояснение: канал и переносимые ионы. */
  subtitle?: string;
  ionLabel: string;
  /** Второй ион — для смешанного тока. */
  secondIonLabel?: string;
  direction: Direction;
  color: string;
  /** Активность канала 0..1: открытие, свечение, поток ионов. */
  active: number;
  frame: number;
  width?: number;
  style?: React.CSSProperties;
};

/** Детерминированное положение иона в потоке: зависит только от кадра. */
const flow = (frame: number, index: number, count: number, speed: number) =>
  ((frame * speed) / 100 + index / count) % 1;

/** Полоса, в которой движутся ионы: ниже неё идут подписи. */
const FLOW_TOP = -12;
const FLOW_BOTTOM = 238;

/**
 * Участок мембраны с одним ионным каналом.
 * Стрелка и движение ионов показывают результирующее направление тока.
 */
export const IonChannel: React.FC<Props> = ({
  title,
  subtitle,
  ionLabel,
  secondIonLabel,
  direction,
  color,
  active,
  frame,
  width = 300,
  style,
}) => {
  const height = width * (H / W);
  const open = Math.max(0, Math.min(1, active));
  const gate = 4 + open * 10; // раскрытие поры

  const ionCount = 4;
  const inbound = direction !== 'out';
  const outbound = direction === 'out' || direction === 'mixed';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${W} ${H}`} style={style}>
      {/* Внеклеточная сторона / цитоплазма */}
      <rect x={0} y={0} width={W} height={MEMBRANE_TOP} fill="#101B20" opacity={0.55} />
      <rect
        x={0}
        y={MEMBRANE_BOTTOM}
        width={W}
        height={H - MEMBRANE_BOTTOM}
        fill="#0C1519"
        opacity={0.55}
      />

      {/* Липидный бислой */}
      {[MEMBRANE_TOP, MEMBRANE_BOTTOM].map((cy, row) => (
        <g key={row}>
          {Array.from({length: 15}).map((_, i) => {
            const cx = 10 + i * 20;
            const inPore = cx > PORE_LEFT - 12 && cx < PORE_RIGHT + 12;
            if (inPore) return null;
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={7} fill={colors.pine} opacity={0.9} />
                <line
                  x1={cx}
                  y1={cy + (row === 0 ? 7 : -7)}
                  x2={cx}
                  y2={cy + (row === 0 ? 24 : -24)}
                  stroke={colors.pine}
                  strokeWidth={2.4}
                  opacity={0.6}
                />
              </g>
            );
          })}
        </g>
      ))}

      {/* Белок канала */}
      <g
        style={{
          filter: open > 0.05 ? `drop-shadow(0 0 ${10 * open}px ${color})` : undefined,
        }}
      >
        <path
          d={`M${PORE_LEFT - 30} ${MEMBRANE_TOP - 26} L${PORE_LEFT - gate} ${
            MEMBRANE_TOP + 6
          } L${PORE_LEFT - gate} ${MEMBRANE_BOTTOM - 6} L${PORE_LEFT - 30} ${
            MEMBRANE_BOTTOM + 26
          } Z`}
          fill={color}
          opacity={0.35 + open * 0.45}
        />
        <path
          d={`M${PORE_RIGHT + 30} ${MEMBRANE_TOP - 26} L${PORE_RIGHT + gate} ${
            MEMBRANE_TOP + 6
          } L${PORE_RIGHT + gate} ${MEMBRANE_BOTTOM - 6} L${PORE_RIGHT + 30} ${
            MEMBRANE_BOTTOM + 26
          } Z`}
          fill={color}
          opacity={0.35 + open * 0.45}
        />
      </g>

      {/* Ионы: результирующее направление тока */}
      <g opacity={open}>
        {inbound
          ? Array.from({length: ionCount}).map((_, i) => {
              const p = flow(frame, i, ionCount, 3.4);
              const cy = FLOW_TOP + p * (FLOW_BOTTOM - FLOW_TOP);
              const cx = 150 + Math.sin(p * Math.PI * 2 + i) * 5;
              return (
                <g key={`in-${i}`}>
                  <circle cx={cx} cy={cy} r={16} fill={color} opacity={0.92} />
                  <text
                    x={cx}
                    y={cy + 5}
                    textAnchor="middle"
                    fontFamily={fonts.mono}
                    fontSize={14}
                    fill={colors.ink}
                    fontWeight={600}
                  >
                    {ionLabel}
                  </text>
                </g>
              );
            })
          : null}

        {outbound
          ? Array.from({length: direction === 'mixed' ? 2 : ionCount}).map((_, i) => {
              const count = direction === 'mixed' ? 2 : ionCount;
              const p = flow(frame, i, count, direction === 'mixed' ? 2.2 : 3.4);
              const cy = FLOW_BOTTOM - p * (FLOW_BOTTOM - FLOW_TOP);
              const cx = 150 + Math.cos(p * Math.PI * 2 + i) * 5;
              const label = secondIonLabel ?? ionLabel;
              return (
                <g key={`out-${i}`} opacity={direction === 'mixed' ? 0.75 : 1}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={15}
                    fill={direction === 'mixed' ? colors.teal : color}
                    opacity={0.92}
                  />
                  <text
                    x={cx}
                    y={cy + 5}
                    textAnchor="middle"
                    fontFamily={fonts.mono}
                    fontSize={13}
                    fill={colors.ink}
                    fontWeight={600}
                  >
                    {label}
                  </text>
                </g>
              );
            })
          : null}
      </g>

      {/* Подписи — ниже полосы, по которой движутся ионы */}
      <text
        x={W / 2}
        y={H - 30}
        textAnchor="middle"
        fontFamily={fonts.mono}
        fontSize={30}
        fill={open > 0.2 ? colors.milk : colors.grey}
        fontWeight={500}
      >
        {title}
      </text>
      {subtitle ? (
        <text
          x={W / 2}
          y={H - 4}
          textAnchor="middle"
          fontFamily={fonts.mono}
          fontSize={17}
          fill={colors.grey}
        >
          {subtitle}
        </text>
      ) : null}
    </svg>
  );
};
