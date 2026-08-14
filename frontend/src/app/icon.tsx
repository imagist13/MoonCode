import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, oklch(0.62 0.195 255), oklch(0.55 0.22 258) 60%, oklch(0.65 0.22 290))",
          color: "white",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          borderRadius: 8,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        B
      </div>
    ),
    { ...size },
  );
}
