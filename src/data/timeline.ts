/**
 * Тайминг ролика. Всё считается в кадрах при 30 fps —
 * анимации зависят только от номера кадра и полностью воспроизводимы.
 */

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const sec = (s: number) => Math.round(s * FPS);

export type SceneId =
  | 'hook'
  | 'brainHeart'
  | 'sinusNode'
  | 'pacemakerCell'
  | 'actionPotential'
  | 'conduction'
  | 'autonomic'
  | 'finale';

export type SceneSpec = {
  id: SceneId;
  /** Абсолютный кадр начала сцены. */
  from: number;
  /** Длительность сцены в кадрах. */
  durationInFrames: number;
};

const SCENE_SECONDS: {id: SceneId; start: number; end: number}[] = [
  {id: 'hook', start: 0, end: 5},
  {id: 'brainHeart', start: 5, end: 13},
  {id: 'sinusNode', start: 13, end: 22},
  {id: 'pacemakerCell', start: 22, end: 37},
  {id: 'actionPotential', start: 37, end: 48},
  {id: 'conduction', start: 48, end: 58},
  {id: 'autonomic', start: 58, end: 69},
  {id: 'finale', start: 69, end: 78},
];

export const SCENES: SceneSpec[] = SCENE_SECONDS.map(({id, start, end}) => ({
  id,
  from: sec(start),
  durationInFrames: sec(end) - sec(start),
}));

export const TOTAL_FRAMES = SCENES.reduce((acc, s) => acc + s.durationInFrames, 0);

export const sceneStart = (id: SceneId): number => {
  const scene = SCENES.find((s) => s.id === id);
  if (!scene) throw new Error(`Неизвестная сцена: ${id}`);
  return scene.from;
};

/** Длительность плавного входа и выхода каждой сцены, кадры. */
export const SCENE_FADE = 12;

/** Частота сердечных сокращений «спокойного» сердца в ролике. */
export const BASE_BPM = 66;
/** Длина одного сердечного цикла в кадрах при BASE_BPM. */
export const BEAT_FRAMES = (60 / BASE_BPM) * FPS;
