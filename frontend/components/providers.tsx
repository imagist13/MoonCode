"use client";

import * as React from "react";
import { SWRConfig } from "swr";
import { ThemeProvider } from "@/components/common/theme-provider";
import { Toaster } from "@/components/ui/toast";

/**
 * 应用级 Providers 组合：ThemeProvider + SWRConfig + Toaster。
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          shouldRetryOnError: false,
        }}
      >
        {children}
        <Toaster />
      </SWRConfig>
    </ThemeProvider>
  );
}
