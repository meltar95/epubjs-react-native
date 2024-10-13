import React, { useRef } from 'react';
import {
  Animated,
  DimensionValue,
  I18nManager,
  Platform,
  View,
  Easing,
} from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
  Directions,
  TouchableWithoutFeedback,
  GestureStateChangeEvent,
  LongPressGestureHandlerEventPayload,
  TapGesture,
  FlingGesture,
  LongPressGesture,
} from 'react-native-gesture-handler';

interface Props {
  width?: DimensionValue;
  height?: DimensionValue;
  onSingleTap?: () => void;
  onDoubleTap?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
}

export function GestureHandler({
  width = '100%',
  height = '100%',
  onSingleTap,
  onDoubleTap,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onLongPress,
  children,
}: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;

  const handleSwipe = (direction: 'left' | 'right') => {
    const toValue = direction === 'left' ? -300 : 300;
    const rotateTo = direction === 'left' ? 180 : -180;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(rotateY, {
        toValue: rotateTo,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      translateX.setValue(0);
      rotateY.setValue(0);
      direction === 'left' ? onSwipeLeft?.() : onSwipeRight?.();
    });
  };

  const singleTap: TapGesture = Gesture.Tap()
    .maxDuration(250)
    .onStart(() => onSingleTap?.());

  const doubleTap: TapGesture = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => onDoubleTap?.());

  const longPress: LongPressGesture = Gesture.LongPress().onStart(
    (event: GestureStateChangeEvent<LongPressGestureHandlerEventPayload>) =>
      onLongPress?.()
  );

  const swipeLeft: FlingGesture = Gesture.Fling()
    .direction(I18nManager.isRTL ? Directions.RIGHT : Directions.LEFT)
    .onStart(() => handleSwipe('left'));

  const swipeRight: FlingGesture = Gesture.Fling()
    .direction(I18nManager.isRTL ? Directions.LEFT : Directions.RIGHT)
    .onStart(() => handleSwipe('right'));

  const swipeUp = onSwipeUp
    ? Gesture.Fling().direction(Directions.UP).onStart(() => onSwipeUp?.())
    : null;

  const swipeDown = onSwipeDown
    ? Gesture.Fling().direction(Directions.DOWN).onStart(() => onSwipeDown?.())
    : null;

  const gestures: Array<TapGesture | FlingGesture | LongPressGesture> = [
    swipeLeft,
    swipeRight,
    swipeUp,
    swipeDown,
    longPress,
    doubleTap,
    singleTap,
  ].filter(Boolean) as Array<TapGesture | FlingGesture | LongPressGesture>;

  const animatedStyle = {
    transform: [
      { translateX },
      {
        rotateY: rotateY.interpolate({
          inputRange: [-180, 0, 180],
          outputRange: ['-180deg', '0deg', '180deg'],
        }),
      },
    ],
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={Gesture.Exclusive(...gestures)}>
        <Animated.View style={[{ width, height }, animatedStyle]}>
          <TouchableWithoutFeedback>{children}</TouchableWithoutFeedback>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
