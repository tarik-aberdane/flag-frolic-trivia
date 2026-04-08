import { useRef, useEffect, useCallback } from "react";

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
  sprint: boolean;
  jump: boolean;
}

export interface InputSettings {
  sensitivity: number;
  invertY: boolean;
}

const DEFAULT_SETTINGS: InputSettings = {
  sensitivity: 1.0,
  invertY: false,
};

export function useInputHandler(settings?: Partial<InputSettings>) {
  const merged: InputSettings = { ...DEFAULT_SETTINGS, ...settings };
  const keys = useRef<InputState>({
    forward: false, backward: false, left: false, right: false,
    interact: false, sprint: false, jump: false,
  });
  const settingsRef = useRef(merged);
  settingsRef.current = merged;

  // Mouse delta accumulator (consumed each frame)
  const mouseDelta = useRef({ x: 0, y: 0 });

  const handleDown = useCallback((e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case "w": case "arrowup": keys.current.forward = true; break;
      case "s": case "arrowdown": keys.current.backward = true; break;
      case "a": case "arrowleft": keys.current.left = true; break;
      case "d": case "arrowright": keys.current.right = true; break;
      case "e": keys.current.interact = true; break;
      case "shift": keys.current.sprint = true; break;
      case " ": keys.current.jump = true; break;
    }
  }, []);

  const handleUp = useCallback((e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case "w": case "arrowup": keys.current.forward = false; break;
      case "s": case "arrowdown": keys.current.backward = false; break;
      case "a": case "arrowleft": keys.current.left = false; break;
      case "d": case "arrowright": keys.current.right = false; break;
      case "e": keys.current.interact = false; break;
      case "shift": keys.current.sprint = false; break;
      case " ": keys.current.jump = false; break;
    }
  }, []);

  const handleMouse = useCallback((e: MouseEvent) => {
    if (!document.pointerLockElement) return;
    const s = settingsRef.current;
    mouseDelta.current.x += e.movementX * s.sensitivity;
    mouseDelta.current.y += e.movementY * (s.invertY ? -1 : 1) * s.sensitivity;
  }, []);

  const consumeMouseDelta = useCallback(() => {
    const d = { x: mouseDelta.current.x, y: mouseDelta.current.y };
    mouseDelta.current.x = 0;
    mouseDelta.current.y = 0;
    return d;
  }, []);

  const requestLock = useCallback(() => {
    document.body.requestPointerLock();
  }, []);

  const isLocked = useCallback(() => !!document.pointerLockElement, []);

  useEffect(() => {
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    document.addEventListener("mousemove", handleMouse);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
      document.removeEventListener("mousemove", handleMouse);
    };
  }, [handleDown, handleUp, handleMouse]);

  return { keys, consumeMouseDelta, requestLock, isLocked };
}
