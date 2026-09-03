/**
 * Собирает src/styles/fontFaces.ts из локально сохранённых woff2.
 *
 * Шрифты (Inter, IBM Plex Mono, Noto Serif) с кириллическими сабсетами лежат
 * в public/assets/fonts. Скрипт превращает исходный CSS Google Fonts в
 * TypeScript-модуль, где каждый url() заменён на staticFile() —
 * рендер не зависит от сети.
 *
 * Запуск: node scripts/build-font-css.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const FONT_DIR = path.join(process.cwd(), 'public', 'assets', 'fonts');
const TEMPLATE = path.join(FONT_DIR, 'fonts.css.template');
const OUT = path.join(process.cwd(), 'src', 'styles', 'fontFaces.ts');

if (!fs.existsSync(TEMPLATE)) {
  console.error(`Не найден ${TEMPLATE}`);
  process.exit(1);
}

let css = fs.readFileSync(TEMPLATE, 'utf8');

// Блокирующая загрузка: в рендере не должно быть кадров с подменным шрифтом.
css = css.replace(/font-display:\s*swap;/g, 'font-display: block;');

const missing = [];
css = css.replace(/FONTBASE\/([\w.-]+\.woff2)/g, (_m, name) => {
  if (!fs.existsSync(path.join(FONT_DIR, name))) missing.push(name);
  return '${staticFile(\'assets/fonts/' + name + '\')}';
});

if (missing.length) {
  console.error('Отсутствуют файлы шрифтов:', missing.join(', '));
  process.exit(1);
}

const module = `/**
 * СГЕНЕРИРОВАННЫЙ ФАЙЛ — не редактировать вручную.
 * Источник: public/assets/fonts/fonts.css.template
 * Пересборка: node scripts/build-font-css.mjs
 */
import {staticFile} from 'remotion';

export const FONT_FAMILIES_TO_PRELOAD = [
  '400 64px "Inter"',
  '600 64px "Inter"',
  '700 64px "Inter"',
  '400 64px "IBM Plex Mono"',
  '500 64px "IBM Plex Mono"',
  '400 64px "Noto Serif"',
  '600 64px "Noto Serif"',
];

export const FONT_CSS = \`
${css.trim()}
\`;
`;

fs.mkdirSync(path.dirname(OUT), {recursive: true});
fs.writeFileSync(OUT, module);
console.log(`fontFaces.ts собран: ${css.match(/@font-face/g)?.length ?? 0} @font-face`);
