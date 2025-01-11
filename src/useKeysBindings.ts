import { useCallback, useEffect, useMemo, useRef } from "react";
import { Key } from "./types";

interface useKeysProp {
  keys: Key[];
  callback: (e: KeyboardEvent) => void;
  triggerOnAnyKey?: boolean;
}
export const useKeys = ({
  keys,
  callback,
triggerOnAnyKey,
}: useKeysProp) => {
  // Memoized the keys Set to avoid recreating it on every render
  const keysArray = useMemo(() => Array.from(new Set(keys)), [keys]);

  // Memoized the callback to prevent unnecessary effect triggers
  const memoizedCallback = useCallback(callback, [callback]);

  //to track all pressed keys
  const pressedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    // check if all keys are pressed
    const checkKeys = (e: KeyboardEvent) => {
      if (triggerOnAnyKey) {
        // If individualKey is true, only the key that matches the event key should be in the pressed keys
        return keysArray.some((key) => pressedKeys.current.has(key));
      }
      // If individualKey is false, all keys should be pressed
      return (
        keysArray.every((key) => pressedKeys.current.has(key))
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if this key isn't already pressed (prevents repeat events)
      if (!pressedKeys.current.has(e.key)) {
        pressedKeys.current.add(e.key);
        console.log(pressedKeys.current)
        if (checkKeys(e)) {
          memoizedCallback(e);
        }
      }
    };
    

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      // Clear pressed keys on cleanup to prevent memory leaks
      pressedKeys.current.clear();
    };
  }, [keysArray, memoizedCallback]);
};
