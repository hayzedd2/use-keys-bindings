import { useCallback, useEffect, useMemo, useRef } from "react";
import { Key } from "./types";

type KeyModifier = "ctrlKey" | "shiftKey" | "altKey" | "metaKey";
interface useKeysProp {
  keys: Key[];
  callback: (e: KeyboardEvent) => void;
  triggerOnAnyKey?: boolean;
  modifiers?: Partial<Record<KeyModifier, boolean>>;
  preventDefault?: boolean;
}
/**
 * A React hook for handling keyboard shortcuts
 * @param keys - Array of keys to listen for
 * @param callback - Function to call when keys are pressed
 * @param triggerOnAnyKey - If true, triggers on any key in the array. If false, requires all keys
 * @param modifiers - Object specifying which modifier keys (ctrl, shift, alt, meta) should be pressed
 * @param preventDefault - If set to true, disables the browser default behaviour for that key
 */

export const useKeys = ({
  keys,
  callback,
  modifiers = {},
  triggerOnAnyKey,
  preventDefault,
}: useKeysProp) => {
  // Memoized the keys Set to avoid recreating it on every render
  const keysSet = useMemo(() => new Set(keys), [keys]);
  if (keysSet.size == 0){
    throw new Error('useKeys: keys array cannot be empty');
  }

  const memoizedCallback = useCallback(callback, [callback]);
  const pressedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkModifiers = (e: KeyboardEvent): boolean => {
      return Object.entries(modifiers).every(
        ([modifier, required]) => required === e[modifier as KeyModifier]
      );
    };

    const checkKeys = (): boolean => {
      const exactMatch = pressedKeys.current.size == keys.length;

      if (triggerOnAnyKey) {
        return Array.from(keysSet).some((key) =>
          pressedKeys.current.has(key.toLowerCase())
        );
      }
      return Array.from(keysSet).every((key) =>
        pressedKeys.current.has(key.toLowerCase())
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (keysSet.has(key as Key) && preventDefault) {
        e.preventDefault();
      }

      if (!pressedKeys.current.has(key)) {
        pressedKeys.current.add(key);
        console.log(pressedKeys.current);
        if (checkKeys() && checkModifiers(e)) {
          memoizedCallback(e);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.key.toLowerCase());
    };

    // Handle edge cases where keyup might be missed
    const handleBlur = () => {
      pressedKeys.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      pressedKeys.current.clear();
    };
  }, [keysSet, memoizedCallback, modifiers, triggerOnAnyKey, preventDefault]);
};
