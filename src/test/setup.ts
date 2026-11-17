import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// globals: false dans vitest.config.ts → le cleanup automatique de
// Testing Library n'est pas actif, on le déclare explicitement.
afterEach(() => {
  cleanup();
});

// jsdom n'implémente pas ces API utilisées par Radix (Select, Popover) et cmdk.
if (typeof window !== "undefined") {
  const proto = window.HTMLElement.prototype;
  proto.hasPointerCapture ??= () => false;
  proto.setPointerCapture ??= () => {};
  proto.releasePointerCapture ??= () => {};
  proto.scrollIntoView ??= () => {};
  window.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
