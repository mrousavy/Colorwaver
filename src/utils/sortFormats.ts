import type {
  CameraDevice,
  CameraDeviceFormat,
  VideoStabilizationMode,
} from 'react-native-vision-camera';

export function getBestVideoStabilizationMode(
  stabilizationModes: VideoStabilizationMode[],
): VideoStabilizationMode | undefined {
  if (stabilizationModes.includes('cinematic-extended')) {
    return 'cinematic-extended';
  }
  if (stabilizationModes.includes('cinematic')) {
    return 'cinematic';
  }
  if (stabilizationModes.includes('standard')) {
    return 'standard';
  }
  if (stabilizationModes.includes('auto')) {
    return 'auto';
  }
  return undefined;
}

function getVideoStabilizationModeScore(
  stabilizationMode: VideoStabilizationMode,
): number {
  switch (stabilizationMode) {
    case 'cinematic-extended':
      return 4;
    case 'cinematic':
      return 3;
    case 'standard':
      return 2;
    case 'auto':
      return 1;
    case 'off':
    default:
      return 0;
  }
}

/**
 * Custom Format sorter function. Copies the array instead of sorting in-place.
 *
 * Sorts by:
 * * Better/More "stable" Video Stabilization Mode
 * * Lower video resolution for faster processing.
 */
export function sortFormats(
  deviceFormats: readonly CameraDeviceFormat[],
): CameraDeviceFormat[] {
  const formats = [...deviceFormats];
  formats.sort((left, right) => {
    let leftScore = 0;
    let rightScore = 0;

    const leftBestStabilizationMode = getBestVideoStabilizationMode(
      left.videoStabilizationModes,
    );
    const rightBestStabilizationMode = getBestVideoStabilizationMode(
      right.videoStabilizationModes,
    );
    const leftVideoStabilizationScore = getVideoStabilizationModeScore(
      leftBestStabilizationMode ?? 'off',
    );
    const rightVideoStabilizationScore = getVideoStabilizationModeScore(
      rightBestStabilizationMode ?? 'off',
    );
    if (rightVideoStabilizationScore > leftVideoStabilizationScore) {
      rightScore += 1;
    } else if (leftVideoStabilizationScore > rightVideoStabilizationScore) {
      leftScore += 1;
    }

    const leftPixels = left.videoWidth * left.videoHeight;
    const rightPixels = right.videoWidth * right.videoHeight;
    if (rightPixels > leftPixels) {
      rightScore += 1;
    } else if (leftPixels > rightPixels) {
      rightScore += 1;
    }

    return leftScore - rightScore;
  });
  return formats;
}

export function logDevice(device: CameraDevice | undefined) {
  if (device == null) {
    console.log('No Camera Device!');
  } else {
    console.log(`Camera Device: ${device.name} (${device.id})`);
  }
}

export function logFormat(format: CameraDeviceFormat | undefined) {
  if (format == null) {
    console.log('No Camera Format!');
  } else {
    const resolution = `${format.videoWidth}x${format.videoHeight}`;
    const videoStabilizationMode = getBestVideoStabilizationMode(
      format.videoStabilizationModes,
    );
    const minFpsSorted = format.frameRateRanges.sort(
      (left, right) => left.minFrameRate - right.minFrameRate,
    );
    const minFps = minFpsSorted[0];
    const maxFpsSorted = format.frameRateRanges.sort(
      (left, right) => left.maxFrameRate - right.maxFrameRate,
    );
    const maxFps = maxFpsSorted[maxFpsSorted.length - 1];
    const colorSpaces = format.colorSpaces.join(', ');

    console.log(
      `Device Format: ${resolution} (` +
        `Video Stabilization: ${videoStabilizationMode} | ` +
        `Color Spaces: ${colorSpaces} | ` +
        `FPS: ${minFps} FPS - ${maxFps} FPS | ` +
        `ISO: ${format.minISO} - ${format.maxISO} | ` +
        `Supports Video HDR: ${format.supportsVideoHDR})`,
    );
  }
}
