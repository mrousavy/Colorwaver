import React from 'react';
import {useState} from 'react';
import {StatusBar, StatusBarProps} from 'react-native';
import Reanimated, {
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';

interface Props extends Omit<StatusBarProps, 'hidden'> {
  isHidden: Reanimated.SharedValue<boolean>;
}

export function AnimatedStatusBar({
  isHidden: isHiddenAnimatedValue,
  ...props
}: Props): React.ReactElement {
  const [isHidden, setIsHidden] = useState(false);

  useAnimatedReaction(
    () => isHiddenAnimatedValue.value,
    is => {
      runOnJS(setIsHidden)(is);
    },
    [isHiddenAnimatedValue],
  );

  return <StatusBar {...props} hidden={isHidden} />;
}
