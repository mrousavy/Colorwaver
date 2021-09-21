import React, {useCallback} from 'react';
import {StyleSheet, View} from 'react-native';
import {
  Camera,
  CameraProps,
  CameraRuntimeError,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {getColorPalette} from './utils/getColorPalette';
import {hapticFeedback} from './utils/hapticFeedback';
import Reanimated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import ColorTile from './components/ColorTile';
import {
  TapGestureHandler,
  TapGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);

const DEFAULT_COLOR = '#000000';

export function App() {
  const isActive = useSharedValue(true);

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

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (!isActive.value) {
        // handbrake
        return;
      }
      const colors = getColorPalette(frame);
      primaryColor.value = colors.primary;
      secondaryColor.value = colors.secondary;
      backgroundColor.value = colors.background;
      detailColor.value = colors.detail;
    },
    [isActive],
  );

  const onTapGestureEvent =
    useAnimatedGestureHandler<TapGestureHandlerGestureEvent>(
      {
        onStart: () => {
          isActive.value = false;
          runOnJS(hapticFeedback)();
        },
        onFinish: () => {
          isActive.value = true;
        },
      },
      [isActive],
    );
  const cameraAnimatedProps = useAnimatedProps<CameraProps>(
    () => ({
      isActive: isActive.value,
    }),
    [isActive],
  );

  if (device == null) {
    return <View style={styles.blackscreen} />;
  }

  console.log(`Camera Device: ${device.name}`);

  return (
    <TapGestureHandler
      onGestureEvent={onTapGestureEvent}
      maxDurationMs={999999}>
      <Reanimated.View style={styles.container}>
        <ReanimatedCamera
          device={device}
          isActive={true} // <-- overriden by animatedProps
          frameProcessor={frameProcessor}
          style={styles.camera}
          onError={onCameraError}
          onInitialized={onCameraInitialized}
          frameProcessorFps={3}
          animatedProps={cameraAnimatedProps}
        />
        <View style={styles.palettes}>
          <ColorTile name="Primary" color={primaryColor} />
          <ColorTile name="Secondary" color={secondaryColor} />
          <ColorTile name="Background" color={backgroundColor} />
          <ColorTile name="Detail" color={detailColor} />
        </View>
      </Reanimated.View>
    </TapGestureHandler>
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
