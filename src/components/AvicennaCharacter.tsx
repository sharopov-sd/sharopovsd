import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {colors} from '../styles/theme';
import {AVICENNA_IMAGE} from '../data/character';
import {BEAT_FRAMES} from '../data/timeline';

/**
 * Авиценна — спокойный наблюдатель и проводник по физиологии.
 *
 * Если в data/character.ts задан AVICENNA_IMAGE, компонент показывает
 * утверждённый эталонный файл (object-fit: contain, без растяжения).
 * Пока файла нет, рисуется каноническая фигура по character bible:
 * чапан прямого кроя, воротник-стойка, застёжка-Канон у ключицы,
 * наручный измеритель с одной линией пульса, стилус.
 *
 * Лицо намеренно не прорисовывается: силуэт в профиль без черт лица
 * не подменяет утверждённый образ и не превращается в карикатуру.
 * Персонаж всегда обращён вправо — к схеме, которую разбирает,
 * поэтому зеркалить фигуру не нужно (постоянные детали образа —
 * застёжка у левой ключицы, измеритель на левом запястье — остаются на месте).
 */
export const AvicennaCharacter: React.FC<{
  /** Высота фигуры в пикселях кадра. ~15–25% площади кадра. */
  height?: number;
  opacity?: number;
  /** Сила латунной подсветки со стороны схемы. */
  glow?: number;
  style?: React.CSSProperties;
}> = ({height = 760, opacity = 1, glow = 0.7, style}) => {
  const frame = useCurrentFrame();

  // Едва заметное дыхание — фигура живая, но не «дёргается».
  const breath = Math.sin((frame / 30) * 0.9) * 1.4;
  // Линия пульса на измерителе идёт в такт сердцу в кадре.
  const beat = (frame % BEAT_FRAMES) / BEAT_FRAMES;
  const wristPulse = Math.exp(-Math.pow((beat - 0.12) * 6, 2));

  const width = height * (330 / 460);

  if (AVICENNA_IMAGE) {
    return (
      <div style={{...style, opacity, height, width: 'auto'}}>
        <Img
          src={staticFile(AVICENNA_IMAGE)}
          style={{
            height,
            width: 'auto',
            objectFit: 'contain',
            filter: `drop-shadow(0 0 40px rgba(0,0,0,0.6)) drop-shadow(${-8}px 0 ${
              26 * glow
            }px rgba(176,141,63,${0.22 * glow}))`,
          }}
        />
      </div>
    );
  }

  const coat = '#182A33';
  const coatLit = '#223B45';
  const skin = '#1B262B';
  const rim = `rgba(231,196,117,${0.6 * glow})`;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 330 460"
      style={{
        ...style,
        opacity,
        transform: `${style?.transform ?? ''} translateY(${breath}px)`,
        filter: 'drop-shadow(0 18px 50px rgba(0,0,0,0.55))',
      }}
    >
      <defs>
        <linearGradient id="av-coat" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={coat} />
          <stop offset="72%" stopColor={coat} />
          <stop offset="100%" stopColor={coatLit} />
        </linearGradient>
        <linearGradient id="av-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="78%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="av-bottom-fade">
          <rect x="0" y="0" width="330" height="460" fill="url(#av-fade)" />
        </mask>
      </defs>

      <g mask="url(#av-bottom-fade)">
        {/* Чапан: прямой крой до середины бедра, запа́х направо, без орнамента.
            Плечи широкие — фигура читается как силуэт врача, а не как бюст. */}
        <path
          d="M28 460 C 32 372, 44 300, 74 262
             C 92 240, 112 228, 132 222
             L 196 224
             C 224 232, 250 254, 264 292
             C 280 336, 288 396, 292 460 Z"
          fill="url(#av-coat)"
        />
        {/* Контрастная строчка по линии запа́ха — единственная деталь отделки */}
        <path
          d="M188 234 C 176 286, 150 344, 106 386"
          fill="none"
          stroke={colors.milkDim}
          strokeOpacity={0.26}
          strokeWidth={1.8}
          strokeDasharray="8 7"
        />

        {/* Шея */}
        <path d="M122 168 L120 214 L172 216 L168 166 Z" fill={skin} />

        {/* Воротник-стойка 2,5 см, застёгнут под горло */}
        <path
          d="M112 206 C 132 220, 164 222, 182 210 L 190 236 C 162 250, 124 248, 104 234 Z"
          fill={colors.pine}
        />

        {/* Голова: профиль без черт лица. Волосы зачёсаны назад,
            очень короткая борода по линии челюсти. */}
        <path
          d="M110 168 C 96 150, 94 118, 106 96
             C 118 72, 148 60, 170 70
             C 188 78, 197 96, 198 114
             C 199 124, 196 128, 198 133
             C 203 139, 208 146, 206 152
             C 204 158, 197 158, 193 160
             C 196 166, 194 172, 188 175
             C 192 181, 190 188, 182 192
             C 172 198, 156 200, 144 197
             C 128 193, 116 180, 110 168 Z"
          fill={skin}
        />
        {/* Волосы: тёмная масса, зачёсанная назад, без блеска */}
        <path
          d="M106 96 C 118 72, 148 60, 170 70 C 180 75, 188 84, 193 96
             C 176 86, 146 82, 124 92 C 116 96, 110 104, 106 112 Z"
          fill="#0F181C"
        />
        {/* Контурный свет со стороны схемы */}
        <path
          d="M170 70 C 188 78, 197 96, 198 114 C 199 124, 196 128, 198 133
             C 203 139, 208 146, 206 152 C 204 158, 197 158, 193 160
             C 196 166, 194 172, 188 175 C 192 181, 190 188, 182 192"
          fill="none"
          stroke={rim}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
        <path
          d="M196 226 C 226 236, 252 260, 266 300"
          fill="none"
          stroke={rim}
          strokeWidth={2.4}
          strokeOpacity={0.75}
          strokeLinecap="round"
        />

        {/* Левая рука: плечо → локоть → кисть, поднята к схеме */}
        <path
          d="M212 262 L 258 322 L 296 268"
          fill="none"
          stroke={coatLit}
          strokeWidth={38}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Рукав закатан на два оборота — открыто предплечье */}
        <path
          d="M266 308 L 294 270"
          fill="none"
          stroke={skin}
          strokeWidth={31}
          strokeLinecap="round"
        />
        {/* Кисть */}
        <ellipse cx="298" cy="264" rx="14" ry="12" fill={skin} transform="rotate(-40 298 264)" />

        {/* Наручный измеритель: узкий стальной браслет, одна линия пульса */}
        <g transform="rotate(-42 278 290)">
          <rect x="260" y="281" width="34" height="16" rx="3" fill="#2E393F" />
          <rect x="263" y="284" width="28" height="10" rx="2" fill="#0B1316" />
          <path
            d="M265 289 L271 289 L274 285 L277 294 L280 289 L289 289"
            fill="none"
            stroke={colors.milk}
            strokeOpacity={0.3 + wristPulse * 0.7}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        </g>

        {/* Стилус-перо с тёмным кончиком */}
        <line x1="293" y1="257" x2="310" y2="227" stroke="#8A939A" strokeWidth={4.4} strokeLinecap="round" />
        <line x1="307" y1="232" x2="311" y2="225" stroke="#0B1316" strokeWidth={4.8} strokeLinecap="round" />

        {/* Застёжка-Канон у левой ключицы: вертикальная планка и один зубец */}
        <g
          transform="translate(140 250) scale(1)"
          filter={`drop-shadow(0 0 7px rgba(231,196,117,${0.55 * glow}))`}
        >
          <line x1="0" y1="0" x2="0" y2="20" stroke={colors.brass} strokeWidth={2.6} />
          <path
            d="M0 12 L4 12 L7 3 L10 18 L13 12"
            fill="none"
            stroke={colors.brass}
            strokeWidth={2.6}
            strokeLinejoin="miter"
          />
        </g>
      </g>
    </svg>
  );
};
