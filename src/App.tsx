import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {AppState, Dimensions, Platform, StyleSheet, View} from 'react-native';
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
import {AnimatedStatusBar} from './components/AnimatedStatusBar';
import {BlurView} from '@react-native-community/blur';

const IS_IOS = Platform.OS === 'ios';
const BackgroundView = IS_IOS
  ? Reanimated.createAnimatedComponent(BlurView)
  : Reanimated.View;

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  isActive: true,
});

const SCREEN_WIDTH = Dimensions.get('window').width;
const SAFE_BOTTOM = StaticSafeAreaInsets.safeAreaInsetsBottom;

const DEFAULT_COLOR = '#000000';
const MAX_FRAME_PROCESSOR_FPS = 3;

const TILE_SIZE = SCREEN_WIDTH / 4;
const ACTIVE_TILE_HEIGHT = TILE_SIZE * 1.3 + SAFE_BOTTOM;
const ACTIVE_TILE_SCALE = 0.9;
const ACTIVE_CONTAINER_SCALE = 0.95;
const ACTIVE_CONTAINER_PADDING = TILE_SIZE - TILE_SIZE * ACTIVE_TILE_SCALE;
const TRANSLATE_Y_ACTIVE =
  (SCREEN_WIDTH - SCREEN_WIDTH * ACTIVE_CONTAINER_SCALE) / 2 + SAFE_BOTTOM;

export function App() {
  const [frameProcessorFps, setFrameProcessorFps] = useState(3);
  const isPageActive = useSharedValue(true);
  const isHolding = useSharedValue(false);

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
      withSpring(isHolding.value ? 0 : 1, {
        mass: 1,
        damping: 500,
        stiffness: 800,
        restDisplacementThreshold: 0.0001,
      }),
    [isHolding],
  );
  const palettesStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: interpolate(
            isActiveAnimation.value,
            [0, 1],
            [1, ACTIVE_CONTAINER_SCALE],
          ),
        },
        {
          translateY: interpolate(
            isActiveAnimation.value,
            [0, 1],
            [0, -TRANSLATE_Y_ACTIVE],
          ),
        },
      ],
      padding: interpolate(
        isActiveAnimation.value,
        [0, 1],
        [0, ACTIVE_CONTAINER_PADDING],
      ),
      borderRadius: interpolate(isActiveAnimation.value, [0, 1], [0, 25]),
    }),
    [isActiveAnimation],
  );
  const colorTileStyle = useAnimatedStyle(
    () => ({
      borderRadius: interpolate(isActiveAnimation.value, [0, 1], [0, 15]),
      transform: [
        {
          scale: interpolate(
            isActiveAnimation.value,
            [0, 1],
            [1, ACTIVE_TILE_SCALE],
          ),
        },
      ],
      width: TILE_SIZE,
      height: interpolate(
        isActiveAnimation.value,
        [0, 1],
        [ACTIVE_TILE_HEIGHT, TILE_SIZE],
      ),
      paddingBottom: interpolate(
        isActiveAnimation.value,
        [0, 1],
        [SAFE_BOTTOM, 0],
      ),
    }),
    [isActiveAnimation],
  );

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (isHolding.value) {
        // handbrake
        return;
      }
      const colors = getColorPalette(frame, 'lowest');
      if (colors == null) {
        return;
      }
      primaryColor.value = colors.primary;
      secondaryColor.value = colors.secondary;
      backgroundColor.value = colors.background;
      detailColor.value = colors.detail;
    },
    [isHolding],
  );

  const onTapBegin = useWorkletCallback(() => {
    isHolding.value = true;
    runOnJS(hapticFeedback)('selection');
  }, [isHolding]);
  const onTapEnd = useWorkletCallback(() => {
    isHolding.value = false;
  }, [isHolding]);

  const cameraAnimatedProps = useAnimatedProps<CameraProps>(
    () => ({
      isActive: !isHolding.value && isPageActive.value,
    }),
    [isHolding, isPageActive],
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
      isPageActive.value = state === 'active';
    });
    return () => {
      listener.remove();
    };
  }, [isPageActive, isHolding]);

  if (device == null) {
    return <View style={styles.blackscreen} />;
  }

  console.log(`Camera Device: ${device.name}`);

  return (
    <TapGestureHandler
      onBegan={onTapBegin}
      onEnded={onTapEnd}
      onFailed={onTapEnd}
      enabled={true}
      minPointers={1}
      maxDurationMs={999999}>
      <Reanimated.View style={styles.container}>
        <AnimatedStatusBar
          barStyle="light-content"
          animated={true}
          isHidden={isHolding}
        />
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
        <BackgroundView
          blurAmount={25}
          blurRadius={25}
          blurType="material"
          style={[styles.palettes, palettesStyle]}>
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
        </BackgroundView>
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
    backgroundColor: IS_IOS ? 'transparent' : 'white',
  },
});
