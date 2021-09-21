import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {AppState, Dimensions, StyleSheet, View} from 'react-native';
import {
  Camera,
  CameraProps,
  CameraRuntimeError,
  FrameProcessorPerformanceSuggestion,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {getColorPalette} from './utils/getColorPalette';
import {hapticFeedback} from './utils/hapticFeedback';
import Reanimated, {
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  useWorkletCallback,
  withSpring,
} from 'react-native-reanimated';
import ColorTile from './components/ColorTile';
import {TapGestureHandler} from 'react-native-gesture-handler';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  isActive: true,
});

const DEFAULT_COLOR = '#000000';
const MAX_FRAME_PROCESSOR_FPS = 3;
const SCREEN_WIDTH = Dimensions.get('window').width;
const TRANSLATE_Y_ACTIVE =
  (SCREEN_WIDTH - SCREEN_WIDTH * 0.9) / 2 +
  StaticSafeAreaInsets.safeAreaInsetsBottom;

const COLOR_TILE_SIZE = SCREEN_WIDTH / 4;

export function App() {
  const [frameProcessorFps, setFrameProcessorFps] = useState(3);
  const isActive = useSharedValue(true);

  const colorAnimationDuration = useMemo(
    () => (1 / frameProcessorFps) * 1000,
    [frameProcessorFps],
  );

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

  const isActiveAnimation = useDerivedValue(
    () =>
      withSpring(isActive.value ? 1 : 0, {
        mass: 1,
        damping: 500,
        stiffness: 800,
        restDisplacementThreshold: 0.0001,
      }),
    [isActive],
  );
  const palettesStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: interpolate(isActiveAnimation.value, [0, 1], [0.9, 1]),
        },
        {
          translateY: interpolate(
            isActiveAnimation.value,
            [0, 1],
            [-TRANSLATE_Y_ACTIVE, 0],
          ),
        },
      ],
      padding: interpolate(isActiveAnimation.value, [0, 1], [10, 0]),
      borderRadius: interpolate(isActiveAnimation.value, [0, 1], [25, 0]),
    }),
    [isActiveAnimation],
  );
  const colorTileStyle = useAnimatedStyle(
    () => ({
      borderRadius: interpolate(isActiveAnimation.value, [0, 1], [15, 0]),
      margin: interpolate(isActiveAnimation.value, [0, 1], [5, 0]),
      width: COLOR_TILE_SIZE,
      height: interpolate(
        isActiveAnimation.value,
        [0, 1],
        [COLOR_TILE_SIZE * 1.3, COLOR_TILE_SIZE],
      ),
    }),
    [isActiveAnimation],
  );

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (!isActive.value) {
        // handbrake
        return;
      }
      const colors = getColorPalette(frame, 'lowest');
      primaryColor.value = colors.primary;
      secondaryColor.value = colors.secondary;
      backgroundColor.value = colors.background;
      detailColor.value = colors.detail;
    },
    [isActive],
  );

  const onTapBegin = useWorkletCallback(() => {
    isActive.value = false;
    runOnJS(hapticFeedback)();
  }, [isActive]);
  const onTapEnd = useWorkletCallback(() => {
    isActive.value = true;
  }, [isActive]);

  const cameraAnimatedProps = useAnimatedProps<CameraProps>(
    () => ({
      isActive: isActive.value,
    }),
    [isActive],
  );

  const onFrameProcessorPerformanceSuggestionAvailable = useCallback(
    ({suggestedFrameProcessorFps}: FrameProcessorPerformanceSuggestion) => {
      const newFps = Math.min(
        suggestedFrameProcessorFps,
        MAX_FRAME_PROCESSOR_FPS,
      );
      setFrameProcessorFps(newFps);
    },
    [],
  );

  useEffect(() => {
    const listener = AppState.addEventListener('change', state => {
      isActive.value = state === 'active';
    });
    return () => {
      listener.remove();
    };
  }, [isActive]);

  if (device == null) {
    return <View style={styles.blackscreen} />;
  }

  console.log(`Camera Device: ${device.name}`);

  return (
    <TapGestureHandler
      onBegan={onTapBegin}
      onEnded={onTapEnd}
      enabled={true}
      minPointers={1}
      maxDurationMs={999999}>
      <Reanimated.View style={styles.container}>
        <ReanimatedCamera
          device={device}
          isActive={true} // <-- overriden by animatedProps
          frameProcessor={frameProcessor}
          style={styles.camera}
          onError={onCameraError}
          onInitialized={onCameraInitialized}
          frameProcessorFps={frameProcessorFps}
          onFrameProcessorPerformanceSuggestionAvailable={
            onFrameProcessorPerformanceSuggestionAvailable
          }
          animatedProps={cameraAnimatedProps}
        />
        <Reanimated.View style={[styles.palettes, palettesStyle]}>
          <ColorTile
            name="Primary"
            color={primaryColor}
            animationDuration={colorAnimationDuration}
            animatedStyle={colorTileStyle}
          />
          <ColorTile
            name="Secondary"
            color={secondaryColor}
            animationDuration={colorAnimationDuration}
            animatedStyle={colorTileStyle}
          />
          <ColorTile
            name="Background"
            color={backgroundColor}
            animationDuration={colorAnimationDuration}
            animatedStyle={colorTileStyle}
          />
          <ColorTile
            name="Detail"
            color={detailColor}
            animationDuration={colorAnimationDuration}
            animatedStyle={colorTileStyle}
          />
        </Reanimated.View>
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
  },
});
