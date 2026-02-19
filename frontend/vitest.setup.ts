import "@testing-library/jest-dom";
import { expect, vi } from "vitest";

(global as any).expect = expect;
(global as any).vi = vi;

if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
}
