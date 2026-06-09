import { useRouter } from "expo-router";
import { useRef } from "react";

export type SwipeDirection = "left" | "right";

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipeNavigation(config: SwipeConfig) {
  const startX = useRef(0);
  const { onSwipeLeft, onSwipeRight, threshold = 50 } = config;

  const handleTouchStart = (e: any) => {
    startX.current = e.nativeEvent.pageX;
  };

  const handleTouchEnd = (e: any) => {
    const endX = e.nativeEvent.pageX;
    const distance = startX.current - endX;

    if (Math.abs(distance) > threshold) {
      if (distance > 0 && onSwipeLeft) {
        // Swiped left
        onSwipeLeft();
      } else if (distance < 0 && onSwipeRight) {
        // Swiped right
        onSwipeRight();
      }
    }
  };

  return {
    handleTouchStart,
    handleTouchEnd,
  };
}

// Define screen navigation order
export const SCREEN_ORDER = [
  "index",
  "tasks",
  "calendar",
  "goals",
  "habits",
  "analytics",
  "ai-assistant",
];

export function getNextScreen(currentScreen: string, direction: "left" | "right"): string | null {
  const currentIndex = SCREEN_ORDER.indexOf(currentScreen);
  if (currentIndex === -1) return null;

  if (direction === "left") {
    const nextIndex = currentIndex + 1;
    return nextIndex < SCREEN_ORDER.length ? SCREEN_ORDER[nextIndex] : null;
  } else {
    const prevIndex = currentIndex - 1;
    return prevIndex >= 0 ? SCREEN_ORDER[prevIndex] : null;
  }
}
