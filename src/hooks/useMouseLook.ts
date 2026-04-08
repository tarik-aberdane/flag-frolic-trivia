import { useRef, useEffect, useCallback } from "react";

export function useMouseLook() {
  const yaw = useRef(0);
  const pitch = useRef(0.6); // initial pitch angle (looking slightly down)
  const isLocked = useRef(false);

  const requestLock = useCallback(() => {
    document.body.requestPointerLock();
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!document.pointerLockElement) return;
      yaw.current -= e.movementX * 0.003;
      pitch.current = Math.max(0.1, Math.min(1.2, pitch.current - e.movementY * 0.003));
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
