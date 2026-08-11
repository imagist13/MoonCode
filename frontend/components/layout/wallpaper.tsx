interface WallpaperProps {
  className?: string;
}

// 月相壁纸：上层径向光晕 + 下层星点（dark 时更明显）
export function Wallpaper({ className }: WallpaperProps) {
  return (
    <div
      aria-hidden
      className={(
        "wallpaper-moon stars pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      ) + (className ? " " + className : "")}
    />
  );
}
