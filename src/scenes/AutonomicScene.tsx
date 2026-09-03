import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts, layout, type} from '../styles/theme';
import {PacemakerGraph} from '../components/PacemakerGraph';
import {SceneLabel, SceneTitle, useAppear, useSceneFade} from '../components/SceneChrome';
import {AP_MODES, bpm} from '../data/pacemaker';

/** Общее окно времени для обеих половин: сравнение честное. */
const WINDOW_MS = 2300;
const GRAPH_W = 452;
const GRAPH_H = 330;

const Side: React.FC<{
  side: 'left' | 'right';
  title: string;
  receptors: string;
  effect: string;
  color: string;
  cfg: (typeof AP_MODES)['baseline'];
  progress: number;
  appear: number;
  rateReveal: number;
}> = ({side, title, receptors, effect, color, cfg, progress, appear, rateReveal}) => {
  const isLeft = side === 'left';
  return (
    <div
      style={{
        position: 'absolute',
        left: isLeft ? layout.safeSide : layout.width / 2 + 28,
        top: 352,
        width: layout.width / 2 - layout.safeSide - 28,
        opacity: appear,
        transform: `translateY(${interpolate(appear, [0, 1], [16, 0])}px)`,
      }}
    >
      <SceneTitle align="left" size={type.h3} color={color}>
        {title}
      </SceneTitle>
      <div style={{marginTop: 10}}>
        <SceneLabel size={type.tiny} color={colors.grey}>
          {receptors}
        </SceneLabel>
      </div>

      <PacemakerGraph
        cfg={cfg}
        windowMs={WINDOW_MS}
        progress={progress}
        width={GRAPH_W}
        height={GRAPH_H}
        showAxisLabels={false}
        strokeOverride={color}
        slopeHint={color}
        style={{marginTop: 22, marginLeft: -14}}
      />

      <div style={{marginTop: 2, height: 58}}>
        <SceneLabel size={type.tiny} color={color} style={{lineHeight: 1.5}}>
          {effect}
        </SceneLabel>
      </div>

      <div
        style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'baseline',
          gap: 12,
          opacity: rateReveal,
        }}
      >
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 72,
            fontWeight: 500,
            color,
            letterSpacing: '-0.02em',
          }}
        >
          {bpm(cfg)}
        </span>
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: type.tiny,
            letterSpacing: '0.12em',
            color: colors.grey,
          }}
        >
          имп./мин
        </span>
      </div>
    </div>
  );
};

/**
 * Сцена 7 (58–69 с). Симпатическое и парасимпатическое влияние
 * на наклон фазы 4. Обе половины показаны в одном окне времени:
 * при более крутой фазе 4 порог достигается чаще.
 */
export const AutonomicScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const fade = useSceneFade(durationInFrames);

  const progress = interpolate(frame, [26, 236], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const leftIn = useAppear(6, 190);
  const rightIn = useAppear(20, 190);
  const rateReveal = useAppear(150);
  const centerPhrase = useAppear(216);
  const dividerReveal = interpolate(frame, [10, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity: fade}}>
      {/* Латунная вертикаль раздела */}
      <div
        style={{
          position: 'absolute',
          left: layout.width / 2 - 1,
          top: 336,
          width: 2,
          height: (1032 - 336) * dividerReveal,
          background: `linear-gradient(to bottom, rgba(176,141,63,0), ${colors.brass}, rgba(176,141,63,0))`,
        }}
      />

      <Side
        side="left"
        title="Симпатическая"
        receptors="β₁ · цАМФ ↑"
        effect="круче · порог быстрее"
        color={colors.sympathetic}
        cfg={AP_MODES.sympathetic}
        progress={progress}
        appear={leftIn}
        rateReveal={rateReveal}
      />

      <Side
        side="right"
        title="Парасимпатическая"
        receptors="M₂ · цАМФ ↓ · gK ↑"
        effect="положе · порог медленнее"
        color={colors.tealLit}
        cfg={AP_MODES.parasympathetic}
        progress={progress}
        appear={rightIn}
        rateReveal={rateReveal}
      />

      {/* Общая шкала времени — сравнение в одном окне */}
      <div
        style={{
          position: 'absolute',
          left: layout.safeSide,
          right: layout.safeSide,
          top: 1046,
          textAlign: 'center',
          opacity: rateReveal * 0.85,
        }}
      >
        <SceneLabel size={type.tiny}>одно и то же окно времени · 2,3 секунды</SceneLabel>
      </div>

      {/* Центральная фраза сцены */}
      <div
        style={{
          position: 'absolute',
          left: layout.safeSide,
          right: layout.safeSide,
          top: 1136,
          textAlign: 'center',
          opacity: centerPhrase,
          transform: `translateY(${interpolate(centerPhrase, [0, 1], [14, 0])}px)`,
        }}
      >
        <SceneTitle size={type.h3}>
          Они меняют скорость.
          <br />
          Источник ритма остаётся в сердце.
        </SceneTitle>
      </div>
    </AbsoluteFill>
  );
};
