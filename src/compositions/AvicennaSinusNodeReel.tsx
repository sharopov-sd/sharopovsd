import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {colors, fonts} from '../styles/theme';
import {SCENES, SceneId} from '../data/timeline';
import {Backdrop} from '../components/Backdrop';
import {BrandMark} from '../components/BrandMark';
import {FontLoader} from '../components/FontLoader';
import {Subtitle} from '../components/Subtitle';
import {HookScene} from '../scenes/HookScene';
import {BrainHeartScene} from '../scenes/BrainHeartScene';
import {SinusNodeScene} from '../scenes/SinusNodeScene';
import {PacemakerCellScene} from '../scenes/PacemakerCellScene';
import {ActionPotentialScene} from '../scenes/ActionPotentialScene';
import {ConductionScene} from '../scenes/ConductionScene';
import {AutonomicScene} from '../scenes/AutonomicScene';
import {FinaleScene} from '../scenes/FinaleScene';

const SCENE_COMPONENTS: Record<SceneId, React.FC<{durationInFrames: number}>> = {
  hook: HookScene,
  brainHeart: BrainHeartScene,
  sinusNode: SinusNodeScene,
  pacemakerCell: PacemakerCellScene,
  actionPotential: ActionPotentialScene,
  conduction: ConductionScene,
  autonomic: AutonomicScene,
  finale: FinaleScene,
};

/**
 * «Почему сердце сокращается само? Автоматизм синусового узла»
 * Вертикальный ролик 1080×1920, 30 fps, ~78 секунд.
 *
 * Фон, выходные данные и субтитры живут вне сцен и работают
 * в абсолютном времени ролика; каждая сцена — в собственном.
 */
export const AvicennaSinusNodeReel: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: colors.ink, fontFamily: fonts.sans}}>
      <FontLoader />
      <Backdrop />

      {SCENES.map((scene) => {
        const Scene = SCENE_COMPONENTS[scene.id];
        return (
          <Sequence
            key={scene.id}
            from={scene.from}
            durationInFrames={scene.durationInFrames}
            name={scene.id}
          >
            <Scene durationInFrames={scene.durationInFrames} />
          </Sequence>
        );
      })}

      <BrandMark />
      <Subtitle />
    </AbsoluteFill>
  );
};
