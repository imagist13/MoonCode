"use client";
import { useEffect, useRef } from "react";
import { mountSoftActionWheel, type SoftActionWheelOptions } from "./SoftActionWheelEngine.js";
import type { MotionController } from "./motion-runtime";

export function SoftActionWheel({
  options,
  className,
  onAction,
}: {
  options?: SoftActionWheelOptions;
  className?: string;
  onAction?: (action: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<MotionController | null>(null);
  const actionRef = useRef(onAction);

  useEffect(() => {
    actionRef.current = onAction;
  }, [onAction]);

  useEffect(() => {
    const element = host.current!;
    const handleAction = (event: Event) => {
      const detail = (event as CustomEvent<{ action?: string }>).detail;
      if (detail?.action) actionRef.current?.(detail.action);
    };
    element.addEventListener("radial-menu-action", handleAction);
    const instance = mountSoftActionWheel(element, options);
    controller.current = instance;
    return () => {
      element.removeEventListener("radial-menu-action", handleAction);
      instance.destroy();
      controller.current = null;
    };
    // Options are updated below without remounting the state machine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    controller.current?.update(options ?? {});
  }, [options]);

  return <div ref={host} className={className} data-motion-component="soft-action-wheel" />;
}
