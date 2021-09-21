/* globals __getColorPalette */
import type {Frame} from 'react-native-vision-camera';

export interface Palette {
  primary: string;
  secondary: string;
  background: string;
  detail: string;
}

export enum ColorPaletteQuality {
  lowest = 0,
  low = 1,
  high = 2,
  highest = 3,
}

// Frame Processor Plugin name
declare global {
  var __getColorPalette: (frame: Frame, quality: 0 | 1 | 2 | 3) => Palette;
}

export function getColorPalette(
  frame: Frame,
  quality: ColorPaletteQuality = ColorPaletteQuality.highest,
): Palette {
  'worklet';
  return __getColorPalette(frame, quality);
}
