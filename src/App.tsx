import React, {useCallback, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {
  Camera,
  CameraRuntimeError,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import Reanimated from 'react-native-reanimated';
import {getColorPalette} from './getColorPalette';
import {useSharedValue} from 'react-native-reanimated';
import ColorTile from './components/ColorTile';

Reanimated.addWhitelistedNativeProps({
  text: true,
});

const DEFAULT_COLOR = '#000000';

export function App() {
  const [isActive, setIsActive] = useState(true);

  const devices = useCameraDevices('wide-angle-camera');
  const device = devices.back;
  const primaryColor = useSharedValue(DEFAULT_COLOR);
  const secondaryColor = useSharedValue(DEFAULT_COLOR);
  const backgroundColor = useSharedValue(DEFAULT_COLOR);
  const detailColor = useSharedValue(DEFAULT_COLOR);

  const onCameraError = useCallback((error: CameraRuntimeError) => {
    console.error(`${error.code}: ${error.message}`, error.cause);
  }, []);
  const onCameraInitialized = useCallback(() => {
    console.log('Camera initialized!');
  }, []);

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    const colors = getColorPalette(frame);
    primaryColor.value = colors.primary;
    secondaryColor.value = colors.secondary;
    backgroundColor.value = colors.background;
    detailColor.value = colors.detail;
  }, []);

  const onPressIn = useCallback(() => {
    setIsActive(false);
  }, []);
  const onPressOut = useCallback(() => {
    setIsActive(true);
  }, []);

  if (device == null) {
    return <View style={styles.blackscreen} />;
  }

  console.log(`Camera Device: ${device.name}`);

  return (
    <Pressable
      style={styles.container}
      onPressIn={onPressIn}
      onPressOut={onPressOut}>
      <Camera
        device={device}
        isActive={isActive}
        frameProcessor={frameProcessor}
        style={styles.camera}
        onError={onCameraError}
        onInitialized={onCameraInitialized}
        frameProcessorFps={3}
      />
      <View style={styles.palettes}>
        <ColorTile name="Primary" color={primaryColor} />
        <ColorTile name="Secondary" color={secondaryColor} />
        <ColorTile name="Background" color={backgroundColor} />
        <ColorTile name="Detail" color={detailColor} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blackscreen: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  palettes: {
    left: 0,
    bottom: 0,
    height: 100,
    flexDirection: 'row',
    backgroundColor: 'black',
  },
});
