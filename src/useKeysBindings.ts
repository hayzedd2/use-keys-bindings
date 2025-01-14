import { useEffect, useMemo, useRef } from "react";
import { Key, KeyModifier } from "./types";

interface useKeysCommand {
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

class LowercaseSet extends Set<string> {
  add(value: string) {
    return super.add(value.toLowerCase());
  }
  delete(value: string) {
    return super.delete(value.toLowerCase());
  }
  has(value: string) {
    return super.has(value.toLowerCase());
  }
}

const checkModifiers = (
  pressedKeys: Set<string>,
  modifiers?: Partial<Record<KeyModifier, boolean>>
): boolean => {
  if (!modifiers || Object.keys(modifiers).length === 0) {
    return true;
  }
  return Object.entries(modifiers).every(
    ([modifier, required]) => required === pressedKeys.has(modifier as Key)
  );
};

const checkKeys = (
  pressedKeys: Set<string>,
  keySet: Set<string>,
  triggerOnAnyKey = false
): boolean => {
  if (triggerOnAnyKey) {
    return Array.from(keySet).some((key) => pressedKeys.has(key));
  }
  return Array.from(keySet).every((key) => pressedKeys.has(key));
};

export const useKeys = (...commands: useKeysCommand[]) => {
  if (commands.some((cmd) => cmd.keys.length === 0)) {
    throw new Error("Empty keys array is not allowed");
  }
  const keySets = useMemo(
    () => commands.map((command) => new LowercaseSet(command.keys)),
    [commands]
  );
  const commandCallbacks = useMemo(
    () => commands.map((command) => command.callback),
    [commands]
  );

  const pressedKeys = useRef<Set<string>>(new LowercaseSet());

  const handleKeyDown = (e: KeyboardEvent) => {
    if (pressedKeys.current.has(e.key)) return;
    pressedKeys.current.add(e.key);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      const keySet = keySets[i];

      if (command.preventDefault && keySet.has(e.key as Key)) {
        e.preventDefault();
      }

      if (!checkModifiers(pressedKeys.current, command.modifiers)) continue;
      if (!checkKeys(pressedKeys.current, keySet, command.triggerOnAnyKey))
        continue;
      commandCallbacks[i](e);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    pressedKeys.current.delete(e.key);
  };

  const handleBlur = () => {
    pressedKeys.current.clear();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      pressedKeys.current.clear();
    };
  }, [handleKeyDown, handleKeyUp, handleBlur]);
};
