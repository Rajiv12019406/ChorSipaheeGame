/* eslint-env jest */

const chain = () => {
  const api = {
    duration: () => api,
    delay: () => api,
    springify: () => api,
    damping: () => api,
  };
  return api;
};

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: {
      call: () => {},
      createAnimatedComponent: c => c,
      View: ReactNative.View,
      Text: ReactNative.Text,
    },
    FadeIn: chain(),
    FadeInDown: chain(),
    FadeInUp: chain(),
    FadeOutLeft: chain(),
    ZoomIn: chain(),
    useSharedValue: v => ({value: v}),
    useAnimatedStyle: () => ({}),
    useAnimatedProps: () => ({}),
    withTiming: v => v,
    withDelay: (_d, v) => v,
    interpolate: () => 0,
    runOnJS: fn => fn,
    Easing: {},
    createAnimatedComponent: c => c,
  };
});

jest.mock('react-native-gesture-handler', () => {
  const {View} = require('react-native');
  return {
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    PanGestureHandler: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
  };
});

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

jest.mock('react-native-screens', () => {
  const {View} = require('react-native');
  return {
    enableScreens: jest.fn(),
    Screen: View,
    ScreenContainer: View,
    NativeScreen: View,
    NativeScreenContainer: View,
  };
});

jest.mock('react-native-svg', () => {
  const {View} = require('react-native');
  return {
    __esModule: true,
    default: View,
    Svg: View,
    Circle: View,
    Rect: View,
    Defs: View,
    RadialGradient: View,
    Stop: View,
  };
});
