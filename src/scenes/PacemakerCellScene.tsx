import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts, layout, type} from '../styles/theme';
import {PacemakerCell} from '../components/PacemakerCell';
import {PacemakerGraph} from '../components/PacemakerGraph';
import {IonChannel} from '../components/IonChannel';
import {SceneLabel, SceneTitle, useAppear, useSceneFade} from '../components/SceneChrome';
import {AP_MODES, cycleMs, potentialAt} from '../data/pacemaker';

export const GRAPH = {
  left: 96,
  top: 552,
  width: 888,
  height: 424,
  cycles: 2,
} as const;

const cfg = AP_MODES.baseline;
/** Доля прогресса, на которой заканчивается фаза 4 первого цикла. */
export const PHASE4_END = cfg.phase4 / (cycleMs(cfg) * GRAPH.cycles);

/**
 * Сцена 4 (22–37 с). Переход внутрь одной пейсмейкерной клетки.
 * У клетки нет стабильного потенциала покоя: линия сама поднимается к порогу.
 * Последовательно подсвечиваются Iᶠ, кальциевые каналы T-типа и порог.
 */
export const PacemakerCellScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const fade = useSceneFade(durationInFrames);

  // Клетка выходит на первый план, затем уходит в угол как «препарат».
  const cellIn = useAppear(2, 170);
  const park = interpolate(frame, [58, 104], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const cellWidth = interpolate(park, [0, 1], [520, 250]);
  const cellLeft = interpolate(park, [0, 1], [280, 700]);
  const cellTop = interpolate(park, [0, 1], [640, 326]);

  // Построение фазы 4: медленно, чтобы было видно «сам движется».
  const progress = interpolate(frame, [96, 396], [0, PHASE4_END], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const graphIn = useAppear(88, 200);
  const titleIn = useAppear(70);

  // Токи фазы 4: сначала Iᶠ, затем к нему добавляется кальций T-типа.
  const ifActive = interpolate(frame, [128, 168, 340, 392], [0, 1, 1, 0.45], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const caTActive = interpolate(frame, [252, 300], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Порог подсвечивается, когда линия к нему приближается.
  const thresholdGlow = interpolate(frame, [330, 396], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Мембрана клетки светится тем сильнее, чем ближе потенциал к порогу.
  const tNow = progress * cycleMs(cfg) * GRAPH.cycles;
  const vNow = potentialAt(cfg, tNow % cycleMs(cfg)).v;
  const charge = interpolate(vNow, [cfg.mdp, cfg.threshold], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fragments: {at: number; text: string; color: string}[] = [
    {at: 118, text: 'нет стабильного потенциала покоя', color: colors.milkDim},
    {at: 250, text: 'спонтанная диастолическая деполяризация', color: colors.brass},
    {at: 356, text: 'порог −40 мВ', color: colors.brassLit},
  ];
  const activeFragment = fragments.filter((f) => frame >= f.at).pop();

  return (
    <AbsoluteFill style={{opacity: fade}}>
      {/* Заголовок сцены */}
      <div
        style={{
          position: 'absolute',
          left: layout.safeSide,
          top: 300,
          width: 600,
          opacity: titleIn,
        }}
      >
        <SceneLabel color={colors.brass}>фаза 4</SceneLabel>
        <SceneTitle align="left" size={type.h2} style={{marginTop: 14}}>
          Потенциал сам движется к порогу
        </SceneTitle>
      </div>

      {/* Клетка */}
      <div
        style={{
          position: 'absolute',
          left: cellLeft,
          top: cellTop,
          opacity: cellIn,
        }}
      >
        <PacemakerCell width={cellWidth} charge={charge} />
        <div
          style={{
            marginTop: 8,
            width: cellWidth,
            opacity: interpolate(park, [0, 1], [1, 0.85]),
          }}
        >
          <SceneLabel size={type.tiny} style={{textAlign: 'center'}}>
            клетка синусового узла
          </SceneLabel>
        </div>
      </div>

      {/* График мембранного потенциала */}
      <div
        style={{
          position: 'absolute',
          left: GRAPH.left,
          top: GRAPH.top,
          opacity: graphIn,
          transform: `translateY(${interpolate(graphIn, [0, 1], [18, 0])}px)`,
        }}
      >
        <PacemakerGraph
          cfg={cfg}
          cycles={GRAPH.cycles}
          progress={progress}
          width={GRAPH.width}
          height={GRAPH.height}
          thresholdGlow={thresholdGlow}
        />
      </div>

      {/* Что поддерживает подъём — прямо в поле графика, куда придёт кривая */}
      <div
        style={{
          position: 'absolute',
          left: GRAPH.left + 560,
          top: GRAPH.top + 56,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div style={{opacity: ifActive, display: 'flex', alignItems: 'center', gap: 14}}>
          <span style={{width: 26, height: 3, background: colors.brass, borderRadius: 2}} />
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: type.micro,
              color: colors.brass,
              letterSpacing: '0.06em',
            }}
          >
            Iᶠ · HCN-каналы
          </span>
        </div>
        <div style={{opacity: caTActive, display: 'flex', alignItems: 'center', gap: 14}}>
          <span style={{width: 26, height: 3, background: colors.sympathetic, borderRadius: 2}} />
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: type.micro,
              color: colors.sympathetic,
              letterSpacing: '0.06em',
            }}
          >
            Ca²⁺ · каналы T-типа
          </span>
        </div>
        <div
          style={{
            opacity: thresholdGlow,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <span
            style={{
              width: 26,
              height: 0,
              borderTop: `3px dashed ${colors.brassLit}`,
            }}
          />
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: type.micro,
              color: colors.brassLit,
              letterSpacing: '0.06em',
            }}
          >
            порог −40 мВ
          </span>
        </div>
      </div>

      {/* Короткие фрагменты текста, синхронные с движением графика */}
      {activeFragment ? (
        <div
          key={activeFragment.at}
          style={{
            position: 'absolute',
            left: GRAPH.left + 8,
            top: GRAPH.top + GRAPH.height + 8,
            opacity: interpolate(frame - activeFragment.at, [0, 12], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            fontFamily: fonts.mono,
            fontSize: type.micro,
            letterSpacing: '0.08em',
            color: activeFragment.color,
          }}
        >
          {activeFragment.text}
        </div>
      ) : null}

      {/* Токи, поддерживающие фазу 4 */}
      <div
        style={{
          position: 'absolute',
          left: 138,
          top: 1044,
          display: 'flex',
          gap: 96,
        }}
      >
        <IonChannel
          title="Iᶠ"
          subtitle="HCN · смешанный Na⁺/K⁺"
          ionLabel="Na⁺"
          secondIonLabel="K⁺"
          direction="mixed"
          color={colors.brass}
          active={ifActive}
          frame={frame}
          width={300}
        />
        <IonChannel
          title="I(Ca,T)"
          subtitle="кальций T-типа"
          ionLabel="Ca²⁺"
          direction="in"
          color={colors.sympathetic}
          active={caTActive}
          frame={frame}
          width={300}
        />
      </div>

      {/* Уточнение о природе Iᶠ */}
      <div
        style={{
          position: 'absolute',
          left: layout.safeSide,
          right: layout.safeSide,
          top: 1382,
          textAlign: 'center',
          opacity: interpolate(frame, [176, 210], [0, 0.9], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <SceneLabel size={type.tiny}>результирующий ток Iᶠ — входящий</SceneLabel>
      </div>
    </AbsoluteFill>
  );
};
