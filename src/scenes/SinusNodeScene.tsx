import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors, layout, type} from '../styles/theme';
import {AnatomicalHeart} from '../components/AnatomicalHeart';
import {Callout, SceneLabel, useAppear, useSceneFade} from '../components/SceneChrome';
import {POINTS} from '../components/heartGeometry';
import {BEAT_FRAMES} from '../data/timeline';

const HEART_W = 620;
const HEART_LEFT = 230;
const HEART_TOP = 470;
const K = HEART_W / 400; // масштаб viewBox → пиксели кадра

/** Мелкая анатомическая подпись с короткой выносной линией. */
const AnatomyTag: React.FC<{
  text: string;
  textX: number;
  textY: number;
  toX: number;
  toY: number;
  opacity: number;
}> = ({text, textX, textY, toX, toY, opacity}) => {
  if (opacity <= 0.01) return null;
  return (
    <>
      <svg
        style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}
        width={layout.width}
        height={layout.height}
      >
        <line
          x1={textX + 8}
          y1={textY + 10}
          x2={toX}
          y2={toY}
          stroke={colors.grey}
          strokeWidth={1.2}
          opacity={opacity * 0.7}
        />
        <circle cx={toX} cy={toY} r={3.5} fill={colors.grey} opacity={opacity * 0.9} />
      </svg>
      <div style={{position: 'absolute', left: textX, top: textY, opacity}}>
        <SceneLabel size={type.tiny}>{text}</SceneLabel>
      </div>
    </>
  );
};

/** Импульсы, расходящиеся от группы клеток синусового узла. */
const SaPulses: React.FC<{frame: number; strength: number}> = ({frame, strength}) => {
  if (strength <= 0) return null;
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const phase = ((frame / BEAT_FRAMES + i / 3) % 1);
        const r = 12 + phase * 90;
        const opacity = (1 - phase) * 0.5 * strength;
        return (
          <circle
            key={i}
            cx={POINTS.sinusNode.x}
            cy={POINTS.sinusNode.y}
            r={r}
            fill="none"
            stroke={colors.brassLit}
            strokeWidth={2.4}
            opacity={opacity}
          />
        );
      })}
    </g>
  );
};

/**
 * Сцена 3 (13–22 с). Камера приближается к правому предсердию,
 * открывается полупрозрачный разрез, видна группа пейсмейкерных клеток
 * у соединения верхней полой вены и правого предсердия.
 */
export const SinusNodeScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const fade = useSceneFade(durationInFrames);

  const zoom = interpolate(frame, [14, 132], [1, 1.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const cutaway = interpolate(frame, [56, 124], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const saGlow = interpolate(frame, [88, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pulses = interpolate(frame, [130, 170], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const beat = (frame / BEAT_FRAMES) % 1;

  // Точка синусового узла в координатах элемента и на экране.
  const saLocal = {x: POINTS.sinusNode.x * K, y: POINTS.sinusNode.y * K};
  const saScreenBase = {x: HEART_LEFT + saLocal.x, y: HEART_TOP + saLocal.y};
  const target = {x: 470, y: 720};
  const shift = interpolate(frame, [14, 132], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const tx = (target.x - saScreenBase.x) * shift;
  const ty = (target.y - saScreenBase.y) * shift;

  const calloutReveal = useAppear(150, 190);
  const svcLabel = useAppear(96);
  const raLabel = useAppear(114);

  return (
    <AbsoluteFill style={{opacity: fade}}>
      {/* Область камеры: мягко гаснет к низу, чтобы не спорить с субтитрами */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: layout.stageTop - 40,
          height: layout.stageBottom - layout.stageTop + 60,
          overflow: 'hidden',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, #000 7%, #000 82%, transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, #000 7%, #000 82%, transparent 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: HEART_LEFT,
            top: HEART_TOP - (layout.stageTop - 40),
            transform: `translate(${tx}px, ${ty}px) scale(${zoom})`,
            transformOrigin: `${saLocal.x}px ${saLocal.y}px`,
          }}
        >
          <AnatomicalHeart
            idPrefix="sinus"
            width={HEART_W}
            beat={beat}
            cutaway={cutaway}
            saGlow={saGlow}
          >
            <SaPulses frame={frame} strength={pulses} />
          </AnatomicalHeart>
        </div>
      </div>

      {/* Анатомические ориентиры с короткими выносками */}
      <AnatomyTag
        opacity={svcLabel * 0.92}
        text="верхняя полая вена"
        textX={596}
        textY={506}
        toX={512}
        toY={548}
      />
      <AnatomyTag
        opacity={raLabel * 0.92}
        text="правое предсердие · разрез"
        textX={layout.safeSide}
        textY={928}
        toX={402}
        toY={898}
      />

      {/* Главная подпись сцены */}
      <Callout
        x={604}
        y={520}
        toX={target.x + 8}
        toY={target.y}
        title="Синусовый узел"
        subtitle="главный водитель ритма"
        reveal={calloutReveal}
      />

      {/* Уточнение масштаба: это группа клеток, а не одна клетка */}
      <div
        style={{
          position: 'absolute',
          left: layout.safeSide,
          right: layout.safeSide,
          top: 1300,
          textAlign: 'center',
          opacity: interpolate(frame, [190, 220], [0, 0.9], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <SceneLabel size={type.tiny} color={colors.grey}>
          группа специализированных клеток вдоль пограничного гребня
        </SceneLabel>
      </div>
    </AbsoluteFill>
  );
};
