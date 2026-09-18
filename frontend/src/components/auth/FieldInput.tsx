"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface FieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

/** 极简表单输入：标签在上、细边框、无图标 */
export const FieldInput = forwardRef<HTMLInputElement, FieldInputProps>(
  function FieldInput({ label, error, hint, className, id, ...props }, ref) {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-xs font-medium tracking-wide text-gray-600 uppercase dark:text-gray-400"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          {...props}
          className={cn(
            "block w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:border-gray-900 focus:ring-0 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:border-gray-100",
            error && "border-red-400 focus:border-red-500 dark:border-red-500/60",
            className,
          )}
        />
        {(error || hint) && (
          <p
            className={cn(
              "text-xs",
              error ? "text-red-500" : "text-gray-400 dark:text-gray-500",
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  },
);