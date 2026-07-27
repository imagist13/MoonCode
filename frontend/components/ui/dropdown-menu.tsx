"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * DropdownMenu —— 极简版：useState 控制显隐，点击外部关闭。
 * 保持 shadcn API：DropdownMenu / DropdownMenuTrigger / DropdownMenuContent / DropdownMenuItem。
 */

interface DropdownCtx {
  open: boolean;
  setOpen: (v: boolean) => void;
  rootRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownCtx = React.createContext<DropdownCtx | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <DropdownCtx.Provider value={{ open, setOpen, rootRef }}>
      <div ref={rootRef} className="relative inline-block">
        {children}
      </div>
    </DropdownCtx.Provider>
  );
}

export interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ onClick, ...props }, ref) => {
  const ctx = React.useContext(DropdownCtx);
  if (!ctx) throw new Error("DropdownMenuTrigger must be used inside DropdownMenu");
  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="menu"
      aria-expanded={ctx.open}
      onClick={(e) => {
        onClick?.(e);
        ctx.setOpen(!ctx.open);
      }}
      {...props}
    />
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end" | "center";
  sideOffset?: number;
}

export function DropdownMenuContent({
  className,
  align = "end",
  sideOffset = 8,
  style,
  children,
  ...props
}: DropdownMenuContentProps) {
  const ctx = React.useContext(DropdownCtx);
  if (!ctx) throw new Error("DropdownMenuContent must be used inside DropdownMenu");
  if (!ctx.open) return null;
  const alignCls =
    align === "start"
      ? "left-0"
      : align === "center"
      ? "left-1/2 -translate-x-1/2"
      : "right-0";
  return (
    <div
      role="menu"
      style={{ marginTop: sideOffset, ...style }}
      className={cn(
        "absolute z-50 min-w-[10rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        alignCls,
        "top-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
}

export const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuItemProps
>(({ className, inset, onClick, ...props }, ref) => {
  const ctx = React.useContext(DropdownCtx);
  return (
    <button
      ref={ref}
      role="menuitem"
      type="button"
      onClick={(e) => {
        onClick?.(e);
        ctx?.setOpen(false);
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

export function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-semibold", className)}
      {...props}
    />
  );
}
