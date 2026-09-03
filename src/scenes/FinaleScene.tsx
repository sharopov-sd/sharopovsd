import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts, layout, type} from '../styles/theme';
import {AnatomicalHeart} from '../components/AnatomicalHeart';
import {AvicennaCharacter} from '../components/AvicennaCharacter';
import {CanonMark} from '../components/BrandMark';
import {SceneTitle, useAppear, useSceneFade} from '../components/SceneChrome';
import {BEAT_FRAMES} from '../data/timeline';
import {HANDLE} from '../data/character';

/**
 * Сцена 8 (69–78 с). Возвращаются Авиценна и сокращающееся сердце.
 * Финальная мысль, затем — выходные данные и анонс следующей записи.
 */
export const FinaleScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const fade = useSceneFade(durationInFrames);

  const beat = (frame / BEAT_FRAMES) % 1;

  const heartIn = useAppear(2, 190);
  const avicennaIn = useAppear(10, 190);
  const line1 = useAppear(30);
  const line2 = useAppear(52);

  // Финальный блок сменяет утверждение, а не спорит с ним за внимание.
  const statementOut = interpolate(frame, [148, 176], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const brandIn = interpolate(frame, [178, 208], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const teaserIn = interpolate(frame, [222, 250], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity: fade}}>
      {/* Сердце продолжает биться на протяжении всего финала */}
      <div
        style={{
          position: 'absolute',
          left: 430,
          top: 396,
          opacity: heartIn * interpolate(brandIn, [0, 1], [1, 0.4]),
        }}
      >
        <AnatomicalHeart idPrefix="finale" width={468} beat={beat} saGlow={0.85} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: interpolate(avicennaIn, [0, 1], [-160, -76]),
          top: 560,
          opacity: avicennaIn * 0.95 * interpolate(brandIn, [0, 1], [1, 0.45]),
        }}
      >
        <AvicennaCharacter height={560} glow={0.8} />
      </div>

      {/* Финальное утверждение: выведено крупно, субтитрами не дублируется */}
      <div
        style={{
          position: 'absolute',
          left: layout.safeSide,
          right: layout.safeSide,
          top: 1188,
          textAlign: 'center',
          opacity: statementOut,
        }}
      >
        <SceneTitle
          size={type.h2}
          style={{
            opacity: line1,
            transform: `translateY(${interpolate(line1, [0, 1], [16, 0])}px)`,
          }}
        >
          Сердце получает влияние извне.
        </SceneTitle>
        <SceneTitle
          size={type.h2}
          color={colors.brassLit}
          style={{
            marginTop: 16,
            opacity: line2,
            transform: `translateY(${interpolate(line2, [0, 1], [16, 0])}px)`,
          }}
        >
          Но первый импульс рождается внутри него.
        </SceneTitle>
      </div>

      {/* Выходные данные */}
      <div
        style={{
          position: 'absolute',
          left: layout.safeSide,
          right: layout.safeSide,
          top: 1150,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 22,
          opacity: brandIn,
          transform: `translateY(${interpolate(brandIn, [0, 1], [18, 0])}px)`,
        }}
      >
        <CanonMark size={64} glow={0.8} />
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 700,
            fontSize: 66,
            letterSpacing: '-0.01em',
            color: colors.milk,
          }}
        >
          {HANDLE}
        </div>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: type.micro,
            letterSpacing: '0.16em',
            color: colors.grey,
            textTransform: 'uppercase',
          }}
        >
          второй канон · книга I · основания
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: fonts.mono,
            fontSize: type.micro,
            letterSpacing: '0.04em',
            color: colors.brass,
            opacity: teaserIn,
            textAlign: 'center',
          }}
        >
          Следующий канон: как импульс превращается в ЭКГ
        </div>
      </div>
    </AbsoluteFill>
  );
};
