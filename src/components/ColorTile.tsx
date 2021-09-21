import React from 'react';
import Reanimated, {
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import AnimateableText from 'react-native-animateable-text';
import {StyleSheet, Text, ViewStyle} from 'react-native';
import {useAnimatedColor} from '../utils/useAnimatedColor';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';

type ColorTileProps = {
  name: string;
  color: Reanimated.SharedValue<string>;
  animationDuration: number;
  animatedStyle?: ViewStyle;
};

const ColorTile = ({
  name,
  color,
  animationDuration,
  animatedStyle,
}: ColorTileProps) => {
  const animatedColor = useAnimatedColor(color, animationDuration);
  const animatedBackgroundStyle = useAnimatedStyle(
    () => ({
      backgroundColor: animatedColor.value,
    }),
    [],
  );

  const animatedProps = useAnimatedProps(() => ({
    text: color.value,
  }));

  return (
    <Reanimated.View
      style={[styles.tile, animatedBackgroundStyle, animatedStyle]}>
      <Text style={styles.text}>{name}</Text>
      <AnimateableText
        animatedProps={animatedProps}
        style={[styles.text, styles.smallerText]}
      />
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
    paddingTop: 5,
    paddingRight: 5,
    paddingBottom: 5 + StaticSafeAreaInsets.safeAreaInsetsBottom,
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
  },
});

export default ColorTile;
