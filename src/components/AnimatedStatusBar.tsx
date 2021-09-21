import React from 'react';
import {useState} from 'react';
import {StatusBar, StatusBarProps} from 'react-native';
import Reanimated, {
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';

interface Props extends Omit<StatusBarProps, 'hidden'> {
  isVisible: Reanimated.SharedValue<boolean>;
}

export function AnimatedStatusBar({
  isVisible,
  ...props
}: Props): React.ReactElement {
  const [isHidden, setIsHidden] = useState(false);

  useAnimatedReaction(
    () => isVisible.value,
    is => {
      runOnJS(setIsHidden)(!is);
    },
    [isVisible],
  );

  return <StatusBar {...props} hidden={isHidden} />;
}
