import React, {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {FONT_CSS, FONT_FAMILIES_TO_PRELOAD} from '../styles/fontFaces';

/**
 * Подключает локальные шрифты (Inter, IBM Plex Mono, Noto Serif
 * с кириллическими сабсетами) и задерживает рендер, пока они не готовы.
 * Ни один кадр не должен уйти в видео с подменным шрифтом.
 */
export const FontLoader: React.FC = () => {
  const [handle] = useState(() => delayRender('Загрузка шрифтов'));

  useEffect(() => {
    const done = () => continueRender(handle);
    Promise.all(
      FONT_FAMILIES_TO_PRELOAD.map((font) => document.fonts.load(font, 'Аа Ca²⁺ Iᶠ'))
    )
      .then(() => document.fonts.ready)
      .then(done)
      .catch(done);
  }, [handle]);

  return <style>{FONT_CSS}</style>;
};
