import React from 'react';
import {colors} from '../styles/theme';

/**
 * Одна пейсмейкерная клетка синусового узла: небольшая веретеновидная
 * клетка со скудным сократительным аппаратом. Показывается только при
 * переходе к клеточной физиологии — в анатомическом масштабе узел
 * остаётся группой клеток.
 */
export const PacemakerCell: React.FC<{
  width: number;
  /** Интенсивность подсветки мембраны, 0..1 — «клетка деполяризуется». */
  charge?: number;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({width, charge = 0, opacity = 1, style}) => {
  const height = width * (200 / 360);
  return (
    <svg width={width} height={height} viewBox="0 0 360 200" style={{...style, opacity}}>
      <defs>
        <radialGradient id="cell-body" cx="0.42" cy="0.38" r="0.72">
          <stop offset="0%" stopColor="#22343A" />
          <stop offset="100%" stopColor="#16252B" />
        </radialGradient>
      </defs>

      {/* Цитоплазма: веретеновидная клетка с вытянутыми концами */}
      <path
        d="M18 104 C22 76, 58 58, 118 54
           C190 49, 268 58, 322 78
           C342 86, 350 100, 338 112
           C318 128, 260 142, 196 146
           C128 150, 52 140, 26 122
           C16 116, 16 110, 18 104 Z"
        fill="url(#cell-body)"
      />
      {/* Мембрана: подсвечивается по мере деполяризации */}
      <path
        d="M18 104 C22 76, 58 58, 118 54
           C190 49, 268 58, 322 78
           C342 86, 350 100, 338 112
           C318 128, 260 142, 196 146
           C128 150, 52 140, 26 122
           C16 116, 16 110, 18 104 Z"
        fill="none"
        stroke={charge > 0.02 ? colors.brass : colors.pine}
        strokeWidth={3.4}
        opacity={0.6 + charge * 0.4}
        style={
          charge > 0.02
            ? {filter: `drop-shadow(0 0 ${6 + charge * 12}px rgba(176,141,63,${0.4 + charge * 0.5}))`}
            : undefined
        }
      />
      {/* Ядро — небольшое, смещено от центра */}
      <ellipse cx={152} cy={98} rx={26} ry={18} fill="#101D22" opacity={0.9} />
      <ellipse cx={152} cy={98} rx={26} ry={18} fill="none" stroke={colors.greyDim} strokeWidth={1.3} />
      {/* Скудный сократительный аппарат — работа этой клетки иная */}
      <g stroke={colors.greyDim} strokeWidth={1.4} opacity={0.4} fill="none">
        <path d="M46 100 C88 84, 116 80, 172 84" />
        <path d="M56 120 C106 130, 162 134, 220 126" />
        <path d="M198 76 C248 74, 292 84, 324 96" />
        <path d="M192 120 C246 120, 288 110, 318 100" />
      </g>
    </svg>
  );
};
