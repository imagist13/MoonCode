"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Dialog —— 极简自实现（不依赖 Radix）。
 * 使用 fixed 定位 + backdrop，符合 shadcn 视觉。
 */
interface DialogCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const DialogCtx = React.createContext<DialogCtx | null>(null);

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({
  open: controlled,
  defaultOpen,
  onOpenChange,
  children,
}: DialogProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen ?? false);
  const open = controlled ?? uncontrolled;
  const setOpen = React.useCallback(
    (v: boolean) => {
      if (controlled === undefined) setUncontrolled(v);
      onOpenChange?.(v);
    },
    [controlled, onOpenChange]
  );

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <DialogCtx.Provider value={{ open, setOpen }}>{children}</DialogCtx.Provider>
  );
}

export function DialogTrigger({
  asChild,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const ctx = React.useContext(DialogCtx);
  if (!ctx) throw new Error("DialogTrigger must be used inside Dialog");
  void asChild; // 兼容 shadcn API，实际不使用 Slot
  return (
    <button
      type="button"
      onClick={(e) => {
        onClick?.(e);
        ctx.setOpen(true);
      }}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(DialogCtx);
  if (!ctx) throw new Error("DialogContent must be used inside Dialog");
  if (!ctx.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => ctx.setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg rounded-lg mx-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  );
}
