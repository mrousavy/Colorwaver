import HapticFeedback from 'react-native-haptic-feedback';

export function hapticFeedback(
  type: HapticFeedback.HapticFeedbackTypes = 'impactLight',
) {
  HapticFeedback.trigger(type);
}
