import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts, layout, type} from '../styles/theme';
import {AnatomicalHeart} from '../components/AnatomicalHeart';
import {SceneLabel, useAppear, useSceneFade} from '../components/SceneChrome';
import {BEAT_FRAMES} from '../data/timeline';

/** Головной мозг, вид сбоку: полушарие, мозжечок, ствол. */
const Brain: React.FC<{width: number; opacity: number}> = ({width, opacity}) => (
  <svg width={width} height={width * (250 / 300)} viewBox="0 0 300 250" style={{opacity}}>
    <path
      d="M62 150 C40 120, 48 74, 80 50 C112 26, 170 20, 210 38 C248 56, 264 96, 252 130
         C244 158, 218 172, 190 175 L120 177 C94 177, 74 168, 62 150 Z"
      fill="#1B2C33"
      stroke={colors.grey}
      strokeWidth={2}
      strokeOpacity={0.5}
    />
    {/* Извилины */}
    <g fill="none" stroke={colors.grey} strokeOpacity={0.35} strokeWidth={2}>
      <path d="M84 66 C104 82, 96 104, 116 116" />
      <path d="M118 48 C140 66, 130 90, 152 104" />
      <path d="M156 42 C178 60, 168 86, 190 100" />
      <path d="M196 50 C218 68, 210 96, 230 110" />
      <path d="M74 112 C96 122, 112 140, 140 146" />
      <path d="M150 128 C176 138, 196 146, 224 142" />
    </g>
    {/* Мозжечок */}
    <ellipse cx={216} cy={182} rx={36} ry={26} fill="#16252B" stroke={colors.grey} strokeOpacity={0.45} strokeWidth={1.8} />
    <g stroke={colors.grey} strokeOpacity={0.3} strokeWidth={1.4}>
      <path d="M188 176 L244 172" fill="none" />
      <path d="M188 186 L244 182" fill="none" />
      <path d="M192 195 L240 192" fill="none" />
    </g>
    {/* Ствол мозга */}
    <path d="M140 172 C138 196, 140 220, 146 248 L176 248 C168 220, 166 196, 168 172 Z" fill="#1B2C33" stroke={colors.grey} strokeWidth={1.6} strokeOpacity={0.45} />
  </svg>
);

/** Нерв с бегущими сигналами. Направление — от мозга к сердцу. */
const NerveLine: React.FC<{
  d: string;
  color: string;
  reveal: number;
  activity: number;
  frame: number;
  offset: number;
}> = ({d, color, reveal, activity, frame, offset}) => (
  <>
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeDasharray="1 1"
      strokeDashoffset={1 - reveal}
      opacity={0.25 + activity * 0.5}
    />
    {activity > 0.02
      ? [0, 1, 2].map((i) => {
          const p = ((frame * 0.014 + i / 3 + offset) % 1) * reveal;
          return (
            <path
              key={i}
              d={d}
              pathLength={1}
              fill="none"
              stroke={color}
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray="0.05 1"
              strokeDashoffset={-p}
              opacity={activity}
              style={{filter: `drop-shadow(0 0 8px ${color})`}}
            />
          );
        })
      : null}
  </>
);

/**
 * Сцена 2 (5–13 с). Мозг и сердце соединены нервами.
 * Влияние ослабевает — сердце продолжает сокращаться.
 * Связь при этом не исчезает: меняется только частота.
 */
export const BrainHeartScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const fade = useSceneFade(durationInFrames);

  const brainIn = useAppear(6, 190);
  const heartIn = useAppear(2, 190);
  const nerveReveal = interpolate(frame, [18, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Сигналы идут вниз, затем влияние намеренно ослабляется —
  // но линия остаётся: связь сохраняется.
  const activity = interpolate(frame, [24, 60, 132, 168], [0, 1, 1, 0.12], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const beat = (frame / BEAT_FRAMES) % 1;
  const conclusion = useAppear(150);
  const note = useAppear(186);

  return (
    <AbsoluteFill style={{opacity: fade}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 292,
          display: 'flex',
          justifyContent: 'center',
          transform: `translateY(${interpolate(brainIn, [0, 1], [-22, 0])}px)`,
        }}
      >
        <Brain width={330} opacity={brainIn * (0.5 + activity * 0.5)} />
      </div>

      {/* Нервные связи: блуждающий нерв и симпатические волокна */}
      <svg
        style={{position: 'absolute', left: 0, top: 0}}
        width={layout.width}
        height={layout.height}
      >
        <NerveLine
          d="M500 545 C470 640, 452 720, 470 812"
          color={colors.teal}
          reveal={nerveReveal}
          activity={activity}
          frame={frame}
          offset={0}
        />
        <NerveLine
          d="M578 545 C612 642, 626 722, 606 812"
          color={colors.sympathetic}
          reveal={nerveReveal}
          activity={activity}
          frame={frame}
          offset={0.5}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 236,
          top: 800,
          opacity: heartIn,
        }}
      >
        <AnatomicalHeart idPrefix="brainheart" width={600} beat={beat} />
      </div>

      {/* Подписи нервов */}
      <div style={{position: 'absolute', left: layout.safeSide, top: 660, opacity: nerveReveal * 0.9}}>
        <SceneLabel color={colors.teal}>блуждающий нерв</SceneLabel>
      </div>
      <div
        style={{
          position: 'absolute',
          right: layout.safeSide,
          top: 660,
          opacity: nerveReveal * 0.9,
          textAlign: 'right',
        }}
      >
        <SceneLabel color={colors.sympathetic}>симпатические волокна</SceneLabel>
      </div>

      {/* Вывод сцены */}
      <div
        style={{
          position: 'absolute',
          left: layout.safeSide,
          right: layout.safeSide,
          top: 1268,
          textAlign: 'center',
          opacity: conclusion,
        }}
      >
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 600,
            fontSize: type.h3,
            color: colors.milk,
            letterSpacing: '-0.01em',
          }}
        >
          Влияние — не источник
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: fonts.mono,
            fontSize: type.tiny,
            letterSpacing: '0.08em',
            color: colors.grey,
            opacity: note,
          }}
        >
          связь сохраняется · меняется частота, а не сам факт удара
        </div>
      </div>
    </AbsoluteFill>
  );
};
