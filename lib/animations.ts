import { Animated, Easing } from "react-native";

/**
 * Fade in animation
 */
export function createFadeInAnimation(duration = 300) {
  const opacity = new Animated.Value(0);

  return {
    opacity,
    animate: () => {
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    },
  };
}

/**
 * Slide in animation
 */
export function createSlideInAnimation(duration = 300, initialValue = 50) {
  const translateX = new Animated.Value(initialValue);

  return {
    translateX,
    animate: () => {
      Animated.timing(translateX, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
  };
}

/**
 * Scale animation
 */
export function createScaleAnimation(duration = 300, initialValue = 0.8) {
  const scale = new Animated.Value(initialValue);

  return {
    scale,
    animate: () => {
      Animated.timing(scale, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
  };
}

/**
 * Bounce animation
 */
export function createBounceAnimation(duration = 600) {
  const scale = new Animated.Value(1);

  return {
    scale,
    animate: () => {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: duration * 0.3,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: duration * 0.7,
          easing: Easing.out(Easing.bounce),
          useNativeDriver: true,
        }),
      ]).start();
    },
  };
}

/**
 * Pulse animation (continuous)
 */
export function createPulseAnimation(duration = 1000) {
  const opacity = new Animated.Value(1);

  const animate = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: duration / 2,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return { opacity, animate };
}

/**
 * Rotate animation (continuous)
 */
export function createRotateAnimation(duration = 2000) {
  const rotation = new Animated.Value(0);

  const animate = () => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return { rotation: rotateInterpolate, animate };
}

/**
 * Shake animation
 */
export function createShakeAnimation(duration = 400) {
  const translateX = new Animated.Value(0);

  return {
    translateX,
    animate: () => {
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 10,
          duration: duration / 4,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -10,
          duration: duration / 4,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 10,
          duration: duration / 4,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: duration / 4,
          useNativeDriver: true,
        }),
      ]).start();
    },
  };
}
