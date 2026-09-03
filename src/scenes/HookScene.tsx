import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts, layout, type} from '../styles/theme';
import {AnatomicalHeart} from '../components/AnatomicalHeart';
import {AvicennaCharacter} from '../components/AvicennaCharacter';
import {SceneTitle, useAppear, useSceneFade} from '../components/SceneChrome';
import {BEAT_FRAMES} from '../data/timeline';

/**
 * Сцена 1 (0–5 с). Один удар в темноте.
 * Крючок: сердце бьётся раньше, чем зритель успевает подумать о мозге.
 */
export const HookScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const fade = useSceneFade(durationInFrames);

  const heartIn = useAppear(4, 160);
  const line1 = useAppear(26);
  const line2 = useAppear(38);
  const question = useAppear(74);
  const avicenna = useAppear(52, 180);

  // Первый удар происходит сразу, дальше — спокойный ритм.
  const beat = (frame / BEAT_FRAMES) % 1;
  const flash = interpolate(frame, [0, 6, 20], [0.55, 0.16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity: fade}}>
      {/* Первый импульс освещает кадр */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(46% 26% at 58% 52%, rgba(176,141,63,${flash}) 0%, rgba(15,26,30,0) 70%)`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: layout.safeSide,
          right: layout.safeSide,
          top: 300,
        }}
      >
        <SceneTitle
          size={type.hero}
          align="left"
          style={{
            opacity: line1,
            transform: `translateY(${interpolate(line1, [0, 1], [26, 0])}px)`,
            fontWeight: 700,
          }}
        >
          СЕРДЦЕ НЕ ЖДЁТ
        </SceneTitle>
        <SceneTitle
          size={type.hero}
          align="left"
          style={{
            opacity: line2,
            transform: `translateY(${interpolate(line2, [0, 1], [26, 0])}px)`,
            fontWeight: 700,
            color: colors.brassLit,
          }}
        >
          КОМАНДЫ МОЗГА
        </SceneTitle>
        <div
          style={{
            marginTop: 34,
            fontFamily: fonts.mono,
            fontSize: type.label,
            letterSpacing: '0.06em',
            color: colors.milkDim,
            opacity: question,
          }}
        >
          Тогда кто запускает каждый удар?
        </div>
      </div>

      {/* Сердце: держится в рабочей зоне, не заходит в полосу субтитров */}
      <div
        style={{
          position: 'absolute',
          left: 384,
          top: 730,
          opacity: heartIn,
          transform: `scale(${interpolate(heartIn, [0, 1], [0.86, 1])})`,
          transformOrigin: 'center center',
        }}
      >
        <AnatomicalHeart idPrefix="hook" width={560} beat={beat} tissueOpacity={0.98} />
      </div>

      {/* Авиценна: появляется сбоку и направляет внимание на сердце */}
      <div
        style={{
          position: 'absolute',
          left: interpolate(avicenna, [0, 1], [-170, -74]),
          top: 800,
          opacity: avicenna * 0.96,
        }}
      >
        <AvicennaCharacter height={600} glow={0.85} />
      </div>
    </AbsoluteFill>
  );
};
