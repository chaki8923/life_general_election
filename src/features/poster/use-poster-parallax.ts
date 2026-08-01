import { useEffect } from "react";
import { DeviceMotion } from "expo-sensors";
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type MotionListener = (rotation: {
  beta: number;
  gamma: number;
}) => void;

const motionListeners = new Set<MotionListener>();
let motionSubscription: ReturnType<typeof DeviceMotion.addListener> | undefined;
let motionStarting = false;

async function startMotion() {
  if (motionSubscription || motionStarting) return;
  motionStarting = true;
  try {
    const available = await DeviceMotion.isAvailableAsync();
    if (!available || motionListeners.size === 0) return;
    const permission = await DeviceMotion.getPermissionsAsync();
    const granted = permission.granted
      ? permission
      : await DeviceMotion.requestPermissionsAsync();
    if (!granted.granted || motionListeners.size === 0) return;

    DeviceMotion.setUpdateInterval(80);
    motionSubscription = DeviceMotion.addListener(({ rotation }) => {
      motionListeners.forEach((listener) => listener(rotation));
    });
  } catch (error) {
    if (__DEV__) console.warn("[poster/parallax]", error);
  } finally {
    motionStarting = false;
  }
}

function subscribeToMotion(listener: MotionListener) {
  motionListeners.add(listener);
  startMotion();
  return () => {
    motionListeners.delete(listener);
    if (motionListeners.size === 0) {
      motionSubscription?.remove();
      motionSubscription = undefined;
    }
  };
}

export function usePosterParallax(enabled: boolean) {
  const reduceMotion = useReducedMotion();
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const active = enabled && !reduceMotion;

  useEffect(() => {
    if (!active || process.env.EXPO_OS === "web") return;

    return subscribeToMotion((rotation) => {
      rotateX.value = withSpring(
        Math.max(-5, Math.min(5, rotation.beta * 4)),
        { damping: 20, stiffness: 180 }
      );
      rotateY.value = withSpring(
        Math.max(-6, Math.min(6, -rotation.gamma * 5)),
        { damping: 20, stiffness: 180 }
      );
    });
  }, [active, rotateX, rotateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 900 },
      { rotateX: `${active ? rotateX.value : 0}deg` },
      { rotateY: `${active ? rotateY.value : 0}deg` },
      { scale: active ? 0.985 : 1 },
    ],
  }));

  const interactionProps =
    process.env.EXPO_OS === "web" && active
      ? {
          onPointerMove: (event: {
            currentTarget?: { clientWidth?: number; clientHeight?: number };
            nativeEvent: { offsetX?: number; offsetY?: number };
          }) => {
            const { offsetX = 0, offsetY = 0 } = event.nativeEvent;
            const width = event.currentTarget?.clientWidth ?? 1;
            const height = event.currentTarget?.clientHeight ?? 1;
            rotateY.value = withSpring(((offsetX / width) * 2 - 1) * 6);
            rotateX.value = withSpring(-((offsetY / height) * 2 - 1) * 5);
          },
          onPointerLeave: () => {
            rotateX.value = withSpring(0);
            rotateY.value = withSpring(0);
          },
        }
      : {};

  return { animatedStyle, interactionProps };
}
