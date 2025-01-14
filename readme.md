# use-keys

A lightweight and flexible React hook for handling keyboard shortcuts. This library makes it easy to bind keys or combinations of keys to specific callbacks, with support for modifiers like `Ctrl`, `Shift`, `Alt`, and `Meta`. 

## Features

- Bind single keys or combinations of keys.
- Support for modifier keys (`Ctrl`, `Shift`, `Alt`, `Meta`).
- `triggerOnAnyKey` option for triggering callbacks on any matching key.
- Prevent default browser behavior for specific keys.
- Flexible and easy-to-use API.

## Installation

```bash
npm install use-keys-bindings
```

or

```bash
yarn add use-keys-bindings
```

## Usage

### Basic Example

```tsx
import React from "react";
import { useKeys } from "use-keys-bindings";

const App = () => {
  useKeys({
    keys: ["ArrowRight", "ArrowLeft"],
    triggerOnAnyKey: true,
    callback: (e) => {
      if (e.key === "ArrowRight") console.log("Move Right");
      if (e.key === "ArrowLeft") console.log("Move Left");
    },
  });

  return <div>Press Arrow Keys!, triggerOnAnyKey is making it possible to do conditional checks in the callback</div>;
};

export default App;
```

### Modifier Keys Example

```tsx
import React from "react";
import { useKeys } from "use-keys-bindings";

const App = () => {
  useKeys({
    keys: ["s"],
    modifiers: {
      Control: true,
    },
    preventDefault: true,
    callback: () => {
      saveDocument()
    },
  });

  return <div>Press Ctrl + S to save, Browser default save option isnt triggered</div>;
};

export default App;
```

## API

### `useKeys(...commands)`

`useKeys` accepts one or more command objects. Each command object defines a specific keyboard shortcut.

#### Command Object Properties

| Property          | Type                                      | Required | Default | Description                                                                                      |
|-------------------|-------------------------------------------|----------|---------|--------------------------------------------------------------------------------------------------|
| `keys`            | `Key[]`                                  | Yes      | —       | An array of keys to listen for (e.g., `["ArrowRight", "s"]`).                                   |
| `callback`        | `(e: KeyboardEvent) => void`             | Yes      | —       | The function to call when the keys are pressed.                                                  |
| `triggerOnAnyKey` | `boolean`                                | No       | `false` | If `true`, the callback will be triggered if any one of the keys is pressed, useful for doing conditional checks in cakkback.                     |
| `modifiers`       | `Partial<Record<KeyModifier, boolean>>`  | No       | —       | An object specifying required modifier keys (e.g., `{ Control: true, Shift: true }`).          |
| `preventDefault`  | `boolean`                                | No       | `false` | Prevents the browser's default behavior for the specified keys.                                  |

### Key Modifiers

The `modifiers` object can include:
- `Control`
- `Shift`
- `Alt`
- `Meta`

## Best Practices

- **Avoid empty `keys` arrays**: This will throw an error, as all commands must specify at least one key.
- **Use unique combinations**: Avoid overlapping key combinations to prevent unexpected behavior.


### Links

- **GitHub Repository**: [use-keys-bindings](https://github.com/hayzedd2/use-keys-bindings)
- **NPM Package**: [use-keys-bindings](https://www.npmjs.com/package/use-keys-bindings)
