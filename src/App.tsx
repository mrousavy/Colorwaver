import React, {useCallback, useState} from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import {
  Camera,
  CameraRuntimeError,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import Reanimated, {
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {getColorPalette} from './getColorPalette';
import {useSharedValue} from 'react-native-reanimated';
import {useAnimatedColor} from './useAnimatedColor';

Reanimated.addWhitelistedNativeProps({
  text: true,
});
const ReanimatedTextInput = Reanimated.createAnimatedComponent(TextInput);

const SCREEN_HEIGHT = Dimensions.get('window').height;
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

  const topLeftColor = useAnimatedColor(primaryColor);
  const topRightColor = useAnimatedColor(secondaryColor);
  const bottomLeftColor = useAnimatedColor(backgroundColor);
  const bottomRightColor = useAnimatedColor(detailColor);

  const tileTopLeftStyle = useAnimatedStyle(
    () => ({
      backgroundColor: topLeftColor.value,
    }),
    [],
  );
  const tileTopRightStyle = useAnimatedStyle(
    () => ({
      backgroundColor: topRightColor.value,
    }),
    [],
  );
  const tileBottomLeftStyle = useAnimatedStyle(
    () => ({
      backgroundColor: bottomLeftColor.value,
    }),
    [],
  );
  const tileBottomRightStyle = useAnimatedStyle(
    () => ({
      backgroundColor: bottomRightColor.value,
    }),
    [],
  );

  // @ts-expect-error `text` is a hidden native prop
  const primaryTextProps = useAnimatedProps<TextInputProps>(() => ({
    text: primaryColor.value,
  }));
  // @ts-expect-error `text` is a hidden native prop
  const secondaryTextProps = useAnimatedProps<TextInputProps>(() => ({
    text: secondaryColor.value,
  }));
  // @ts-expect-error `text` is a hidden native prop
  const backgroundTextProps = useAnimatedProps<TextInputProps>(() => ({
    text: backgroundColor.value,
  }));
  // @ts-expect-error `text` is a hidden native prop
  const detailTextProps = useAnimatedProps<TextInputProps>(() => ({
    text: detailColor.value,
  }));

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
        frameProcessorFps={5}
      />

      <View style={styles.palettes}>
        <Reanimated.View style={[styles.tileTopLeft, tileTopLeftStyle]}>
          <Text style={styles.text}>Primary</Text>
          <ReanimatedTextInput
            style={styles.smallerText}
            animatedProps={primaryTextProps}
          />
        </Reanimated.View>
        <Reanimated.View style={[styles.tileTopRight, tileTopRightStyle]}>
          <Text style={styles.text}>Secondary</Text>
          <ReanimatedTextInput
            style={styles.smallerText}
            animatedProps={secondaryTextProps}
          />
        </Reanimated.View>
        <Reanimated.View style={[styles.tileBottomLeft, tileBottomLeftStyle]}>
          <Text style={styles.text}>Background</Text>
          <ReanimatedTextInput
            style={styles.smallerText}
            animatedProps={backgroundTextProps}
          />
        </Reanimated.View>
        <Reanimated.View style={[styles.tileBottomRight, tileBottomRightStyle]}>
          <Text style={styles.text}>Detail</Text>
          <ReanimatedTextInput
            style={styles.smallerText}
            animatedProps={detailTextProps}
          />
        </Reanimated.View>
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
    flex: 1, // <-- TODO: Make 1x1
  },
  palettes: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    height: SCREEN_HEIGHT / 5,
    flexDirection: 'row',
    backgroundColor: 'black',
  },
  tileTopLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileTopRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileBottomLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileBottomRight: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowOffset: {
      height: 0,
      width: 0,
    },
    textShadowRadius: 2,
    color: 'white',
  },
  smallerText: {
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowOffset: {
      height: 0,
      width: 0,
    },
    textShadowRadius: 2,
    color: 'white',
  },
});
