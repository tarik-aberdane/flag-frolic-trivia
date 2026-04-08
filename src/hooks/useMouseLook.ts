import { useRef, useEffect, useCallback } from "react";

const MOUSE_SENSITIVITY = 0.002;

export function useMouseLook() {
  const yaw = useRef(0);
  const pitch = useRef(0.4); // radians, ~23° looking slightly down
  const isLocked = useRef(false);

  const requestLock = useCallback(() => {
    document.body.requestPointerLock();
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return;
      yaw.current -= e.movementX * MOUSE_SENSITIVITY;
      // Pitch: negative = look up, positive = look down
      // Limits: -40° to 80° (set in radians, -0.698 to 1.396)
      pitch.current = Math.max(
        -40 * (Math.PI / 180),
        Math.min(80 * (Math.PI / 180), pitch.current + e.movementY * MOUSE_SENSITIVITY)
      );
    };

    const onLockChange = () => {
      isLocked.current = !!document.pointerLockElement;
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("pointerlockchange", onLockChange);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointerlockchange", onLockChange);
    };
  }, []);

  return { yaw, pitch, isLocked, requestLock };
}
