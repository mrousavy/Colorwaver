import {Frame, FrameProcessorPlugins} from 'react-native-vision-camera';

export interface Palette {
  primary: string;
  secondary: string;
  background: string;
  detail: string;
}

/**
 * * `'lowest'`: Resize Frame to 50px width
 * * `'low'`: Resize Frame to 100px width
 * * `'high'`: Resize Frame to 250px width
 * * `'highest'`: Don't resize Frame at all
 */
export type ColorPaletteQuality = 'lowest' | 'low' | 'high' | 'highest';

export function getColorPalette(
  frame: Frame,
  quality: ColorPaletteQuality = 'highest',
): Palette | undefined | null {
  'worklet';
  return FrameProcessorPlugins.getColorPalette(frame, quality);
}
