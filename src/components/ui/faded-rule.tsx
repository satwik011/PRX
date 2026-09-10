import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

import { colors } from '@/theme/tokens';

/**
 * Nocturne's signature rule: 1px, fading to transparent over 48px at EACH end.
 *
 * Only freestanding rules fade. Box outlines, in-control separators and in-card
 * row separators stay solid — tokens.md gotcha #9.
 */
export function FadedRule({ inset = 48, className }: { inset?: number; className?: string }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  // Until we know the width, a fixed stop would fade the whole line.
  const stop = width > inset * 2 ? inset / width : 0.25;

  return (
    <LinearGradient
      onLayout={onLayout}
      colors={['transparent', colors.line, colors.line, 'transparent']}
      locations={[0, stop, 1 - stop, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ height: 1 }}
      className={className}
    />
  );
}
