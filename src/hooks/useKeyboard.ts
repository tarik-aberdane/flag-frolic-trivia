import { useRef, useEffect, useCallback } from "react";

interface Keys {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  interact: boolean; // E key
}

export function useKeyboard() {
  const keys = useRef<Keys>({ forward: false, backward: false, left: false, right: false, interact: false });

  const handleDown = useCallback((e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case "w": case "arrowup": keys.current.forward = true; break;
      case "s": case "arrowdown": keys.current.backward = true; break;
      case "a": case "arrowleft": keys.current.left = true; break;
      case "d": case "arrowright": keys.current.right = true; break;
      case "e": keys.current.interact = true; break;
    }
  }, []);

  const handleUp = useCallback((e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case "w": case "arrowup": keys.current.forward = false; break;
      case "s": case "arrowdown": keys.current.backward = false; break;
      case "a": case "arrowleft": keys.current.left = false; break;
      case "d": case "arrowright": keys.current.right = false; break;
      case "e": keys.current.interact = false; break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, [handleDown, handleUp]);

  return keys;
}
