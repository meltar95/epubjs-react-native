import React, { useRef } from 'react';
import { DimensionValue, I18nManager, Platform, View, Animated } from 'react-native';
import {
    GestureHandlerRootView,
    GestureDetector,
    Gesture,
    Directions,
    TouchableWithoutFeedback,
} from 'react-native-gesture-handler';

interface Props {
    width?: DimensionValue;
    height?: DimensionValue;
    onSingleTap: () => void;
    onDoubleTap: () => void;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    onSwipeUp: () => void;
    onSwipeDown: () => void;
    onLongPress: () => void;
    children: React.ReactNode;
}

export function AnimatedPageTurner({
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
    const animatedValue = useRef(new Animated.Value(0)).current;

    const singleTap = Gesture.Tap().maxDuration(250).onStart(onSingleTap);
    const doubleTap = Gesture.Tap()
        .maxDuration(250)
        .numberOfTaps(2)
        .onStart(onDoubleTap);
    const longPress = Gesture.LongPress().onStart(onLongPress);

    const swipeLeft = Gesture.Fling()
        .direction(I18nManager.isRTL ? Directions.RIGHT : Directions.LEFT)
        .onStart(() => {
            Animated.timing(animatedValue, {
                toValue: -1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                onSwipeLeft();
                animatedValue.setValue(0);
            });
        });

    const swipeRight = Gesture.Fling()
        .direction(I18nManager.isRTL ? Directions.LEFT : Directions.RIGHT)
        .onStart(() => {
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                onSwipeRight();
                animatedValue.setValue(0);
            });
        });

    const swipeUp = Gesture.Fling().direction(Directions.UP).onStart(onSwipeUp);
    const swipeDown = Gesture.Fling()
        .direction(Directions.DOWN)
        .onStart(onSwipeDown);

    let lastTap: number | null = null;
    let timer: NodeJS.Timeout;
    const handleDoubleTap = () => {
        if (lastTap) {
            onDoubleTap();
            clearTimeout(timer);
            lastTap = null;
        } else {
            lastTap = Date.now();
            timer = setTimeout(() => {
                onSingleTap();
                lastTap = null;
                clearTimeout(timer);
            }, 500);
        }
    };

    const animatedStyle = {
        transform: [
            {
                translateX: animatedValue.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [-100, 0, 100],
                }),
            },
            {
                rotate: animatedValue.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: ['-10deg', '0deg', '10deg'],
                }),
            },
        ],
        opacity: animatedValue.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [0.5, 1, 0.5],
        }),
    };

    if (Platform.OS === 'ios') {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <GestureDetector
                    gesture={Gesture.Exclusive(
                        swipeLeft,
                        swipeRight,
                        swipeUp,
                        swipeDown,
                        longPress,
                        doubleTap,
                        singleTap
                    )}
                >
                    <TouchableWithoutFeedback
                        style={{ width, height }}
                        onPress={() => Platform.OS === 'ios' && handleDoubleTap()}
                        onLongPress={() => Platform.OS === 'ios' && onLongPress()}
                    >
                        <Animated.View style={[{ width, height }, animatedStyle]}>
                            {children}
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </GestureDetector>
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <GestureDetector gesture={Gesture.Exclusive(swipeLeft, swipeRight)}>
                <Animated.View style={[{ width, height }, animatedStyle]}>
                    {children}
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
}