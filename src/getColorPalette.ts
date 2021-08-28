import {Frame} from 'react-native-vision-camera';

interface Palette {
  primary: string;
  secondary: string;
  background: string;
  detail: string;
}

// Frame Processor Plugin name
declare global {
  var __getColorPalette: (frame: Frame) => Palette;
}

export function getColorPalette(frame: Frame): Palette {
  'worklet';
  return __getColorPalette(frame);
}
