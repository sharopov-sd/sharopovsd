import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts, layout, shadows, type} from '../styles/theme';
import {SUBTITLES, SubtitleCue} from '../data/subtitles';

const FADE = 8;

/** Разбивает строку так, чтобы ключевые термины подсветить латунью. */
const renderLine = (line: string, accent: string[] | undefined): React.ReactNode => {
  if (!accent || accent.length === 0) return line;

  const hit = accent.find((a) => line.includes(a));
  if (!hit) return line;

  const at = line.indexOf(hit);
  const before = line.slice(0, at);
  const after = line.slice(at + hit.length);

  return (
    <>
      {before}
      <span style={{color: colors.brassLit}}>{hit}</span>
      {renderLine(after, accent.filter((a) => a !== hit))}
    </>
  );
};

const activeCue = (frame: number): {cue: SubtitleCue; local: number} | null => {
  for (const cue of SUBTITLES) {
    if (frame >= cue.from && frame < cue.from + cue.durationInFrames) {
      return {cue, local: frame - cue.from};
    }
  }
  return null;
};

/**
 * Субтитры. Показывается ровно одна реплика, не длиннее двух строк.
 * Полоса субтитров всегда на одном месте и не пересекается со схемами.
 */
export const Subtitle: React.FC = () => {
  const frame = useCurrentFrame();
  const found = activeCue(frame);
  if (!found) return null;

  const {cue, local} = found;
  const opacity = interpolate(
    local,
    [0, FADE, cue.durationInFrames - FADE, cue.durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
  const rise = interpolate(local, [0, FADE], [14, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: layout.safeSide,
        right: layout.safeSide,
        top: layout.subtitleTop,
        height: layout.subtitleBottom - layout.subtitleTop,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
        opacity,
        transform: `translateY(${rise}px)`,
      }}
    >
      {/* Тонкая линия-опора: отделяет речь от схемы. */}
      <div
        style={{
          width: 96,
          height: 1,
          background: colors.greyDim,
          marginBottom: 22,
        }}
      />
      {cue.lines.map((line, i) => (
        <span
          key={i}
          style={{
            fontFamily: fonts.sans,
            fontWeight: 500,
            fontSize: type.body,
            lineHeight: 1.32,
            letterSpacing: '-0.005em',
            color: colors.milk,
            textAlign: 'center',
            textShadow: shadows.textDepth,
            textWrap: 'balance',
          }}
        >
          {renderLine(line, cue.accent)}
        </span>
      ))}
    </div>
  );
};
