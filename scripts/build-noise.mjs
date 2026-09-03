/**
 * Генерирует детерминированную текстуру плёночного зерна
 * public/assets/noise.png (160×160, оттенки серого).
 *
 * Тайл заменяет полнокадровый SVG-фильтр feTurbulence: в headless-рендере
 * тот пересчитывался на каждом кадре и стоил больше, чем вся остальная сцена.
 *
 * Запуск: node scripts/build-noise.mjs
 */
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const SIZE = 160;
const OUT = path.join(process.cwd(), 'public', 'assets', 'noise.png');

/** Детерминированный генератор: одна и та же текстура при каждой сборке. */
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const rand = mulberry32(20260903);

// Каждая строка PNG начинается с байта фильтра (0 = None).
const raw = Buffer.alloc(SIZE * (SIZE + 1));
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE + 1)] = 0;
  for (let x = 0; x < SIZE; x++) {
    // Смесь двух распределений: мелкое зерно плюс редкие крупные частицы.
    const fine = rand();
    const coarse = rand() > 0.985 ? rand() * 0.5 : 0;
    const v = Math.min(1, fine * 0.55 + 0.22 + coarse);
    raw[y * (SIZE + 1) + 1 + x] = Math.round(v * 255);
  }
}

const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
};

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // бит на канал
ihdr[9] = 0; // grayscale
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, {level: 9})),
  chunk('IEND', Buffer.alloc(0)),
]);

mkdirSync(path.dirname(OUT), {recursive: true});
writeFileSync(OUT, png);
console.log(
  `noise.png: ${SIZE}×${SIZE}, ${png.length} байт, sha1 ${createHash('sha1')
    .update(png)
    .digest('hex')
    .slice(0, 12)}`
);
