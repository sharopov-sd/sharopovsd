/**
 * Финализация ролика для публикации.
 *
 * Remotion отдаёт кадры энкодеру как MJPEG, поэтому мастер получается
 * с полным диапазоном яркости (pix_fmt yuvj420p) и очень высоким битрейтом.
 * Для доставки нужен стандартный yuv420p с телевизионным (limited) диапазоном,
 * умеренный битрейт и moov-атом в начале файла, иначе часть плееров
 * показывает сдвинутые цвета, а загрузка занимает лишнее время.
 *
 * Запуск: node scripts/finalize-reel.mjs [путь.mp4]
 */
import {execFileSync} from 'node:child_process';
import {existsSync, renameSync, statSync} from 'node:fs';
import path from 'node:path';

const target =
  process.argv[2] ?? path.join(process.cwd(), 'output', 'vtoroy-kanon-sinus-node-reel.mp4');

if (!existsSync(target)) {
  console.error(`Не найден файл ${target}. Сначала выполните npm run render:reel.`);
  process.exit(1);
}

const ffmpegBin = path.join(process.cwd(), 'node_modules', '.bin', 'remotion');
const tmp = target.replace(/\.mp4$/, '.tmp.mp4');

const before = statSync(target).size;

console.log('Финализация: yuv420p (limited range), moov в начало, целевой битрейт…');

execFileSync(
  ffmpegBin,
  [
    'ffmpeg',
    '-y',
    '-i',
    target,
    // Полный диапазон MJPEG → телевизионный, иначе цвета уезжают в плеерах
    '-vf',
    'scale=in_range=full:out_range=limited',
    '-color_range',
    'tv',
    '-pix_fmt',
    'yuv420p',
    '-c:v',
    'libx264',
    '-profile:v',
    'high',
    '-preset',
    'medium',
    '-crf',
    '23',
    '-maxrate',
    '9M',
    '-bufsize',
    '14M',
    '-r',
    '30',
    // Совместимость с мобильными плеерами и быстрая отдача при загрузке
    '-movflags',
    '+faststart',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    tmp,
  ],
  {stdio: ['ignore', 'ignore', 'inherit']}
);

renameSync(tmp, target);

const after = statSync(target).size;
const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(`Готово: ${mb(before)} МБ → ${mb(after)} МБ · ${path.relative(process.cwd(), target)}`);
