import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// globals: false dans vitest.config.ts → le cleanup automatique de
// Testing Library n'est pas actif, on le déclare explicitement.
afterEach(() => {
  cleanup();
});
