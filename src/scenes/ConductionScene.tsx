import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts, layout, type} from '../styles/theme';
import {AnatomicalHeart} from '../components/AnatomicalHeart';
import {ConductionSystem} from '../components/ConductionSystem';
import {ECGTrace} from '../components/ECGTrace';
import {SceneLabel, useAppear, useSceneFade} from '../components/SceneChrome';

const STEPS = [
  {at: 0.0, title: 'Синусовый узел', note: 'импульс возникает'},
  {at: 0.1, title: 'Миокард предсердий', note: 'зубец P'},
  {at: 0.36, title: 'АВ-узел', note: 'физиологическая задержка'},
  {at: 0.58, title: 'Гис — Пуркинье', note: 'быстрое проведение'},
  {at: 0.84, title: 'Миокард желудочков', note: 'комплекс QRS'},
];

/**
 * Сцена 6 (48–58 с). Золотой импульс проходит весь путь:
 * синусовый узел → предсердия → АВ-узел (с задержкой) →
 * система Гиса—Пуркинье → желудочки. Внизу синхронно строится ЭКГ.
 */
export const ConductionScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const fade = useSceneFade(durationInFrames);

  // Первый проход — разъясняющий, второй — в естественном темпе.
  const firstPass = frame < 208;
  const progress = firstPass
    ? interpolate(frame, [18, 198], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : interpolate(frame, [212, 284], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  const ecgProgress = firstPass
    ? interpolate(frame, [18, 198], [0, 0.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : interpolate(frame, [212, 284], [0.5, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  // Сокращение камер идёт вслед за возбуждением, а не одновременно с ним.
  const beat = interpolate(progress, [0.86, 1], [0, 0.42], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const heartIn = useAppear(2, 190);
  const ecgIn = useAppear(24, 200);

  const highlightP = interpolate(progress, [0.08, 0.16, 0.3, 0.4], [0, 1, 1, 0.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const highlightQRS = interpolate(progress, [0.82, 0.9, 1], [0, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity: fade}}>
      {/* Сердце с проводящей системой */}
      <div style={{position: 'absolute', left: 372, top: 306, opacity: heartIn}}>
        <AnatomicalHeart idPrefix="conduction" width={548} beat={beat} tissueOpacity={0.92}>
          <ConductionSystem progress={progress} />
        </AnatomicalHeart>
      </div>

      {/* Порядок прохождения импульса */}
      <div
        style={{
          position: 'absolute',
          left: layout.safeSide,
          top: 372,
          width: 268,
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
        }}
      >
        {STEPS.map((step, i) => {
          const reached = progress >= step.at;
          const active =
            reached && (i === STEPS.length - 1 || progress < STEPS[i + 1].at);
          const opacity = reached ? 1 : 0.28;
          return (
            <div key={step.title} style={{opacity}}>
              <div
                style={{
                  fontFamily: fonts.sans,
                  fontWeight: 600,
                  fontSize: type.label,
                  lineHeight: 1.15,
                  color: active ? colors.brassLit : reached ? colors.milk : colors.grey,
                  letterSpacing: '-0.01em',
                }}
              >
                {step.title}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontFamily: fonts.mono,
                  fontSize: type.tiny,
                  letterSpacing: '0.06em',
                  color: active ? colors.brass : colors.grey,
                }}
              >
                {step.note}
              </div>
            </div>
          );
        })}
      </div>

      {/* Схематичная ЭКГ */}
      <div style={{position: 'absolute', left: layout.safeSide, top: 1044, opacity: ecgIn}}>
        <ECGTrace
          cycles={2}
          progress={ecgProgress}
          width={layout.width - layout.safeSide * 2}
          height={264}
          highlightP={highlightP}
          highlightQRS={highlightQRS}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: layout.safeSide,
          top: 1322,
          opacity: ecgIn * 0.9,
        }}
      >
        <SceneLabel size={type.tiny}>
          зубец P — деполяризация миокарда предсердий, не самого узла
        </SceneLabel>
      </div>
    </AbsoluteFill>
  );
};
