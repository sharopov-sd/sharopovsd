import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts, layout, type} from '../styles/theme';
import {PacemakerGraph} from '../components/PacemakerGraph';
import {PacemakerCell} from '../components/PacemakerCell';
import {IonChannel} from '../components/IonChannel';
import {SceneLabel, SceneTitle, useAppear, useSceneFade} from '../components/SceneChrome';
import {AP_MODES, cycleMs, potentialAt} from '../data/pacemaker';
import {GRAPH, PHASE4_END} from './PacemakerCellScene';

const cfg = AP_MODES.baseline;
const total = cycleMs(cfg) * GRAPH.cycles;
const PHASE0_END = (cfg.phase4 + cfg.phase0) / total;
const CYCLE1_END = (cfg.phase4 + cfg.phase0 + cfg.phase3) / total;

/**
 * Сцена 5 (37–48 с). Достигнут порог: открываются кальциевые каналы L-типа
 * и формируется фаза 0. Затем выход калия даёт фазу 3. После реполяризации
 * цикл начинается снова — два потенциала действия подряд показывают автоматизм.
 */
export const ActionPotentialScene: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const fade = useSceneFade(durationInFrames);

  // Продолжение той же кривой: фаза 0 и фаза 3 подробно, второй цикл — целиком.
  const progress = interpolate(
    frame,
    [0, 10, 74, 148, 296, durationInFrames],
    [PHASE4_END, PHASE4_END, PHASE0_END, CYCLE1_END, 1, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );

  const caLActive = interpolate(frame, [6, 34, 96, 128], [0, 1, 1, 0.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const kActive = interpolate(frame, [78, 108, 168, 196], [0, 1, 1, 0.25], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const phase0Label = useAppear(18);
  const phase3Label = useAppear(88);
  const repeatLabel = useAppear(214);

  const tNow = progress * total;
  const vNow = potentialAt(cfg, tNow % cycleMs(cfg)).v;
  const charge = interpolate(vNow, [cfg.mdp, cfg.peak], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity: fade}}>
      <div
        style={{
          position: 'absolute',
          left: layout.safeSide,
          top: 300,
          width: 620,
        }}
      >
        <SceneLabel color={colors.brass}>фазы 0 и 3</SceneLabel>
        <SceneTitle align="left" size={type.h2} style={{marginTop: 14}}>
          Порог достигнут — и цикл повторяется
        </SceneTitle>
      </div>

      {/* Та же клетка, что и в предыдущей сцене */}
      <div style={{position: 'absolute', left: 700, top: 326}}>
        <PacemakerCell width={250} charge={charge} />
        <div style={{marginTop: 8, width: 250}}>
          <SceneLabel size={type.tiny} style={{textAlign: 'center'}}>
            клетка синусового узла
          </SceneLabel>
        </div>
      </div>

      {/* Кривая: та же геометрия, что и в сцене 4 — переход бесшовный */}
      <div style={{position: 'absolute', left: GRAPH.left, top: GRAPH.top}}>
        <PacemakerGraph
          cfg={cfg}
          cycles={GRAPH.cycles}
          progress={progress}
          width={GRAPH.width}
          height={GRAPH.height}
          thresholdGlow={interpolate(frame, [0, 40], [1, 0.35], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}
        />
      </div>

      {/* Подписи фаз — одной строкой, без переносов */}
      <div
        style={{
          position: 'absolute',
          left: GRAPH.left + 8,
          top: GRAPH.top + GRAPH.height + 4,
          width: GRAPH.width,
          display: 'flex',
          gap: 40,
          whiteSpace: 'nowrap',
          fontFamily: fonts.mono,
          fontSize: type.tiny,
          letterSpacing: '0.06em',
        }}
      >
        <span style={{color: colors.brassLit, opacity: phase0Label}}>Фаза 0 — вход Ca²⁺</span>
        <span style={{color: colors.tealLit, opacity: phase3Label}}>Фаза 3 — выход K⁺</span>
        <span style={{color: colors.grey, opacity: repeatLabel}}>цикл повторяется сам</span>
      </div>

      {/* Каналы фазы 0 и фазы 3 */}
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
          title="I(Ca,L)"
          subtitle="кальций L-типа · фаза 0"
          ionLabel="Ca²⁺"
          direction="in"
          color={colors.brassLit}
          active={caLActive}
          frame={frame}
          width={300}
        />
        <IonChannel
          title="I(K)"
          subtitle="выход калия · фаза 3"
          ionLabel="K⁺"
          direction="out"
          color={colors.tealLit}
          active={kActive}
          frame={frame}
          width={300}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: layout.safeSide,
          right: layout.safeSide,
          top: 1382,
          textAlign: 'center',
          opacity: interpolate(frame, [40, 74], [0, 0.9], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <SceneLabel size={type.tiny}>подъём даёт кальций, а не быстрый натриевый ток</SceneLabel>
      </div>
    </AbsoluteFill>
  );
};
