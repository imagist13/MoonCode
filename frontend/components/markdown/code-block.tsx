"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/** Markdown 代码块 —— 带 copy 按钮。 */
export function CodeBlock({
  children,
  className,
}: React.HTMLAttributes<HTMLPreElement>) {
  const preRef = React.useRef<HTMLPreElement>(null);
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    const text = preRef.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 忽略无权限
    }
  };

  return (
    <div className="relative my-4 overflow-hidden rounded-lg border border-border/60 bg-muted/50">
      <button
        type="button"
        onClick={onCopy}
        aria-label="复制代码"
        className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/80 text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-foreground group-hover:opacity-100"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </button>
      <pre
        ref={preRef}
        className={cn(
          "overflow-x-auto p-4 font-mono text-sm leading-relaxed",
          className
        )}
      >
        {children}
      </pre>
    </div>
  );
}
