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

export const useKeys = (...commands: useKeysCommand[]) => {
  if (commands.some((cmd) => cmd.keys.length === 0)) {
    throw new Error("Empty keys array is not allowed");
  }
  // convert all keys array in commands to sets for faster lookup, basically an array of sets
  const keySets = useMemo(
    () => commands.map((command) => new Set(command.keys)),
    [commands]
  );
  // an array of the callbacks of each commands, -- storing it separately
  const commandCallbacks = useMemo(
    () => commands.map((command) => command.callback),
    [commands]
  );

  //   state to track pressed keys, use ref to maintain state between renders without causing rerenders
  const pressedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkModifiers = (
      e: KeyboardEvent,
      modifiers?: Partial<Record<KeyModifier, boolean>>
    ): boolean => {
      if (!modifiers || Object.keys(modifiers).length === 0) {
        return true; // If no modifiers specified, return true
      }
      return Object.entries(modifiers).every(
        ([modifier, required]) => required === e[modifier as KeyModifier]
      );
    };

    const checkKeys = (keySet: Set<Key>, triggerOnAnyKey = false): boolean => {
      if (triggerOnAnyKey) {
        // [a,b,c,d] for keyset pressing only a would return true
        return Array.from(keySet).some((key) => pressedKeys.current.has(key));
      }
      // [a,b,c,d] for keyset,pressing only a would return false, all a,b,c,d has to be pressed to return true
      return Array.from(keySet).every((key) => pressedKeys.current.has(key));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pressedKeys.current.has(e.key)) {
        pressedKeys.current.add(e.key);
        console.log(pressedKeys.current);
        commands.forEach((command, index) => {
          // command is each object specified in the hook
          if (command.preventDefault && keySets[index].has(e.key as Key)) {
            e.preventDefault();
          }
          if (
            checkKeys(keySets[index], command.triggerOnAnyKey) &&
            checkModifiers(e, command.modifiers)
          ) {
            commandCallbacks[index](e);
          }
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.key);
    };

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
  }, [commands, keySets, commandCallbacks]);
};
