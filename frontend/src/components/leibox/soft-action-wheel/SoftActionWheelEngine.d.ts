import type { MotionOptions, MotionController } from "./motion-runtime";
export type SoftActionWheelOptions = MotionOptions;
export function mountSoftActionWheel(target: HTMLElement, options?: SoftActionWheelOptions): MotionController;
