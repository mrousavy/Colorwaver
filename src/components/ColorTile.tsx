import React from 'react';
import Reanimated, {
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';
import AnimateableText from 'react-native-animateable-text';
import {StyleSheet, Text} from 'react-native';
import {useAnimatedColor} from '../utils/useAnimatedColor';

type ColorTileProps = {
  name: string;
  color: Reanimated.SharedValue<string>;
};

const ColorTile = ({name, color}: ColorTileProps) => {
  const animatedColor = useAnimatedColor(color);
  const animatedStyles = useAnimatedStyle(
    () => ({
      backgroundColor: animatedColor.value,
    }),
    [],
  );

  const animatedProps = useAnimatedProps(() => ({
    text: color.value,
  }));

  return (
    <Reanimated.View style={[styles.tile, animatedStyles]}>
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
