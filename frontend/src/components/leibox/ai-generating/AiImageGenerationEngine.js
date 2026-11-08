// Native DOM port of the preserved reference HTML. No iframe or runtime eval.
// Adapted for the blog: the fixed demo title is removed and the dots follow the
// blog theme tokens, so light/dark mode and page typography stay consistent.
import { createSurface } from "./motion-runtime";

const markup = `
    <div class="container">
        <div class="card" id="interactive-card">
            <div class="grid" id="dot-grid"></div>
        </div>
    </div>
`;

const css = `
        .motion-body {
            --surface-01: var(--blog-muted, #f4f4f5);
            --dot-base: var(--blog-ink, #12120f);
        }

        body {
            margin: 0;
            padding: 0;
            min-height: var(--motion-height);
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: transparent;
            font-family: inherit;
        }

        .container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .card {
            width: 420px;
            height: 420px;
            background-color: var(--surface-01);
            border: 1px solid var(--blog-line, rgba(18, 18, 15, 0.09));
            border-radius: 24px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(20, 18px);
            grid-template-rows: repeat(20, 18px);
            place-items: center;
        }

        .dot {
            width: 12px;
            height: 12px;
            background-color: var(--dot-base);
            border-radius: 50%;
            opacity: 0.08;
            will-change: transform, opacity;
            backface-visibility: hidden;
            transform: translateZ(0) scale(0.333);
        }
`;

export function mountAiImageGeneration(target, options = {}) {
  const scope = createSurface(
    target,
    { markup, css, width: 520, height: 520, responsive: false },
    options,
  );
  const { document, requestAnimationFrame } = scope;

  document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("dot-grid");
    if (!grid) return;

    const cols = 20;
    const rows = 20;
    const dots = [];

    const effectRadius = 110;

    const minScale = 0.333;
    const maxScale = 0.65;

    for (let i = 0; i < rows * cols; i++) {
      const dot = document.createElement("div");
      dot.className = "dot";
      grid.appendChild(dot);

      dots.push({
        el: dot,
        x: (i % cols - cols / 2) * 18,
        y: (Math.floor(i / cols) - rows / 2) * 18,
      });
    }

    const orbs = [
      { rx: 90, ry: 70, sx: 0.7, sy: 1.1, px: 0, py: 0, pulseSpeed: 0 },
      { rx: 70, ry: 95, sx: -1.2, sy: 0.8, px: 2, py: 1.5, pulseSpeed: 0.35 },
    ];

    const animateDots = (timestamp) => {
      const time = timestamp * 0.0012;

      const activeFocus = orbs.map((orb) => {
        const weight =
          orb.pulseSpeed > 0 ? (Math.sin(time * orb.pulseSpeed) + 1) / 2 : 1;

        return {
          x: Math.sin(time * orb.sx + orb.px) * orb.rx,
          y: Math.cos(time * orb.sy + orb.py) * orb.ry,
          weight,
        };
      });

      dots.forEach((dot) => {
        let combinedIntensity = 0;

        activeFocus.forEach((focus) => {
          const dx = focus.x - dot.x;
          const dy = focus.y - dot.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < effectRadius) {
            let intensity = 1 - distance / effectRadius;
            intensity = Math.pow(intensity, 1.4) * focus.weight;

            combinedIntensity += intensity;
          }
        });

        combinedIntensity = Math.min(1.0, combinedIntensity);

        if (combinedIntensity > 0.01) {
          const scale = minScale + (maxScale - minScale) * combinedIntensity;

          dot.el.style.transform = `translateZ(0) scale(${scale})`;
          dot.el.style.opacity = String(0.08 + 0.92 * combinedIntensity);
        } else {
          dot.el.style.transform = `translateZ(0) scale(${minScale})`;
          dot.el.style.opacity = "0.08";
        }
      });

      requestAnimationFrame(animateDots);
    };

    requestAnimationFrame(animateDots);
  });

  scope.ready();
  return scope.controller;
}
