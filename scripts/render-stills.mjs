/**
 * Контрольные кадры для самопроверки макета.
 * Рендерит стоп-кадры на заданных секундах в output/stills/.
 *
 * Запуск: npm run stills
 *         npm run stills -- 12 34.5   (произвольные секунды)
 */
import {existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const COMPOSITION_ID = 'AvicennaSinusNodeReel';
const DEFAULT_SECONDS = [2, 17, 29, 43, 53, 63, 74];
const OUT_DIR = path.join(process.cwd(), 'output', 'stills');

const browserExecutable = [
  process.env.REMOTION_BROWSER_EXECUTABLE,
  // chrome-headless-shell — сборка, совместимая с рендером Remotion
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
]
  .filter(Boolean)
  .find((p) => existsSync(p));

const seconds = process.argv.slice(2).map(Number).filter((n) => Number.isFinite(n));
const targets = seconds.length > 0 ? seconds : DEFAULT_SECONDS;

mkdirSync(OUT_DIR, {recursive: true});

console.log('Сборка проекта…');
const serveUrl = await bundle({
  entryPoint: path.join(process.cwd(), 'src', 'index.ts'),
  onProgress: (p) => {
    if (p % 25 === 0) console.log(`  bundling ${p}%`);
  },
});

const composition = await selectComposition({
  serveUrl,
  id: COMPOSITION_ID,
  browserExecutable,
  chromiumOptions: {gl: 'swangle'},
});

for (const s of targets) {
  const frame = Math.round(s * composition.fps);
  const output = path.join(OUT_DIR, `still-${String(s).padStart(2, '0')}s-f${frame}.png`);
  console.log(`Кадр ${s} с (frame ${frame}) → ${path.relative(process.cwd(), output)}`);
  await renderStill({
    composition,
    serveUrl,
    output,
    frame,
    imageFormat: 'png',
    overwrite: true,
    browserExecutable,
    chromiumOptions: {gl: 'swangle'},
  });
}

console.log(`Готово: ${targets.length} кадров в ${path.relative(process.cwd(), OUT_DIR)}`);
