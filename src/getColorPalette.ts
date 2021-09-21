/* globals __getColorPalette */
import type {Frame} from 'react-native-vision-camera';

export interface Palette {
  primary: string;
  secondary: string;
  background: string;
  detail: string;
}

export enum ColorPaletteQuality {
  /**
   * Resize Frame to 50px width
   */
  lowest = 0,
  /**
   * Resize Frame to 100px width
   */
  low = 1,
  /**
   * Resize Frame to 250px width
   */
  high = 2,
  /**
   * Don't resize Frame at all
   */
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
