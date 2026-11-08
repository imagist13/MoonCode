// Native DOM port of the preserved reference HTML. No iframe or runtime eval.
// Design reference: withAnimation — https://x.com/withAnimationUI/status/2110643020890849625/video/1
// Adapted for the blog: three article actions, Chinese labels, and colors that
// follow the blog theme tokens instead of the demo's fixed light palette.
import { createSurface } from "./motion-runtime";

const markup = `<main class="radial-menu-demo notranslate" translate="no" data-variant="soft" aria-label="文章快捷操作"><div class="rm-stage"><div class="rm-menu" role="menu" id="radial-actions" aria-label="文章快捷操作" inert><button type="button" class="rm-action" role="menuitem" aria-label="分享文章" data-action="share" tabindex="-1" inert><svg class="rm-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.6 6.6-4.1M8.7 13.4l6.6 4.1"/></svg></button><button type="button" class="rm-action" role="menuitem" aria-label="查看评论" data-action="comment" tabindex="-1" inert><svg class="rm-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/></svg></button><button type="button" class="rm-action" role="menuitem" aria-label="回到顶部" data-action="top" tabindex="-1" inert><svg class="rm-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button></div><button type="button" class="rm-toggle" aria-label="打开快捷操作" aria-haspopup="menu" aria-expanded="false" aria-controls="radial-actions"><span class="rm-plus" aria-hidden="true"></span></button></div><span class="rm-status" role="status" aria-live="polite"></span></main>`;

const css = `
.radial-menu-demo{position:relative;width:100%;height:var(--motion-height);overflow:hidden;background:transparent;isolation:isolate;color:var(--blog-ink,#12120f);font-family:inherit;pointer-events:none}
.radial-menu-demo *{box-sizing:border-box}
.rm-stage{position:absolute;left:50%;top:50%;width:960px;height:960px;transform:translate(-50%,-50%) scale(var(--rm-scale,1));transform-origin:center}
.rm-menu{position:absolute;inset:0;pointer-events:none}
.rm-action,.rm-toggle{all:unset;box-sizing:border-box;position:absolute;left:391px;top:391px;display:grid;place-items:center;width:178px;height:178px;border-radius:50%;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;pointer-events:auto;border:1px solid var(--blog-line,rgba(18,18,15,.09));background:var(--blog-surface,#fff);box-shadow:0 14px 24px rgba(0,0,0,.06);color:var(--blog-ink,#12120f)}
.rm-action{opacity:0;visibility:hidden;pointer-events:none}
.rm-icon{display:block;width:94px;height:94px;overflow:visible;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;flex:none;pointer-events:none}
.rm-toggle{z-index:2;left:383px;top:383px;width:194px;height:194px}
.rm-toggle:hover,.rm-action:hover{background:var(--blog-muted,#f2f2ee)}
.rm-toggle:active,.rm-action:active{background:var(--blog-muted,#f2f2ee)}
.rm-plus{position:relative;display:block;width:60px;height:60px;pointer-events:none}
.rm-plus:before,.rm-plus:after{content:"";position:absolute;left:0;top:24px;width:60px;height:12px;border-radius:7px;background:var(--blog-ink,#12120f)}
.rm-plus:after{transform:rotate(90deg)}
.rm-toggle:focus-visible,.rm-action:focus-visible{outline:4px solid var(--blog-soft,#6f6f68);outline-offset:6px}
.rm-status{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
`;

export function mountSoftActionWheel(target, options = {}) {
  const scope = createSurface(
    target,
    { markup, css, width: 960, height: 960, responsive: false },
    options,
  );
  const { document, window, requestAnimationFrame, cancelAnimationFrame, ResizeObserver } = scope;
  // Independent reconstruction; the reference has outward dismissal, not a collapse into the trigger.
  const demo = document.querySelector(".radial-menu-demo"),
    stage = demo.querySelector(".rm-stage"),
    menu = demo.querySelector(".rm-menu"),
    toggle = demo.querySelector(".rm-toggle"),
    plus = demo.querySelector(".rm-plus"),
    status = demo.querySelector(".rm-status");
  const buttons = [...demo.querySelectorAll(".rm-action")],
    count = buttons.length,
    media = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Actions fan out to the upper-left, which is the free space for a bottom-right trigger.
  const angles = buttons.map((_, i) => ((-180 + i * 45) * Math.PI) / 180);
  const motion = { from: 450, openStiffness: 204.0625, openDamping: 15.5, closeStiffness: 820, closeDamping: 57, openGap: 0.015, closeGap: 0, fadeOut: 0.15 };
  const states = buttons.map(() => ({ position: 0, velocity: 0, opacity: 0, blur: 24, fromOpacity: 0, fromBlur: 24, elapsed: 0, delay: 0 }));
  const rotation = { position: 0, velocity: 0 };
  let opened = false, frame = 0, last = 0, destroyed = false, focusIndex = -1, optionObserver, readyFrame = 0;
  const clamp = (n) => Math.min(1, Math.max(0, n));
  const smooth = (n) => { const t = clamp(n); return t * t * (3 - 2 * t); };
  function draw() {
    states.forEach((state, i) => {
      const angle = angles[i] ?? 0, radius = motion.from - (motion.from - 224) * state.position, button = buttons[i];
      button.style.transform = `translate(${Math.cos(angle) * radius}px,${Math.sin(angle) * radius}px)`;
      button.style.opacity = String(state.opacity);
      button.style.filter = state.blur > 0.01 ? `blur(${state.blur}px)` : "none";
      button.style.visibility = state.opacity > 0.001 ? "visible" : "hidden";
      button.inert = !opened || state.opacity < 0.95;
      button.style.pointerEvents = button.inert ? "none" : "auto";
      button.dataset.radius = radius.toFixed(3);
      button.dataset.reveal = state.opacity.toFixed(3);
    });
    plus.style.transform = `rotate(${rotation.position * 45}deg)`;
    plus.style.opacity = String(1 - 0.4 * clamp(rotation.position));
    demo.dataset.open = String(opened);
    demo.dataset.progress = clamp(rotation.position).toFixed(4);
    if (focusIndex >= 0 && !buttons[focusIndex].inert) { const index = focusIndex; focusIndex = -1; focusAction(index); }
  }
  function spring(state, targetValue, dt, stiffness, damping) {
    state.velocity += ((targetValue - state.position) * stiffness - state.velocity * damping) * dt;
    state.position += state.velocity * dt;
    if (Math.abs(state.position - targetValue) < 0.0001 && Math.abs(state.velocity) < 0.002) { state.position = targetValue; state.velocity = 0; }
    return state.position !== targetValue || state.velocity !== 0;
  }
  function settle() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    states.forEach((state) => { state.position = Number(opened); state.velocity = 0; state.opacity = Number(opened); state.blur = opened ? 0 : 24; state.delay = 0; state.elapsed = 1; });
    rotation.position = Number(opened); rotation.velocity = 0; draw(); demo.dataset.moving = "false";
  }
  function tick(time) {
    frame = 0; if (destroyed) return; if (media.matches) { settle(); return; }
    const dt = Math.min(0.032, (time - (last || time - 16)) / 1000); last = time; let moving = false;
    states.forEach((state) => {
      state.elapsed += dt;
      const elapsed = state.elapsed - state.delay;
      if (elapsed < 0) { moving = true; return; }
      const activeDt = Math.min(dt, elapsed);
      for (let i = 0; i < 3; i++) moving = spring(state, Number(opened), activeDt / 3, opened ? motion.openStiffness : motion.closeStiffness, opened ? motion.openDamping : motion.closeDamping) || moving;
      state.opacity = state.fromOpacity + (Number(opened) - state.fromOpacity) * smooth(elapsed / (opened ? 0.1 : motion.fadeOut));
      state.blur = state.fromBlur + ((opened ? 0 : 24) - state.fromBlur) * smooth(elapsed / (opened ? 0.15 : 0.13));
      if (elapsed < Math.max(opened ? 0.1 : motion.fadeOut, opened ? 0.15 : 0.13)) moving = true;
    });
    for (let i = 0; i < 3; i++) moving = spring(rotation, Number(opened), dt / 3, opened ? motion.openStiffness : motion.closeStiffness, opened ? motion.openDamping : motion.closeDamping) || moving;
    draw(); demo.dataset.moving = String(moving);
    if (moving) frame = requestAnimationFrame(tick); else last = 0;
  }
  function wake() { if (destroyed) return; if (media.matches) { settle(); return; } demo.dataset.moving = "true"; if (!frame) frame = requestAnimationFrame(tick); }
  function setOpen(value, focus = -1) {
    if (destroyed) return;
    if (value !== opened) {
      const interrupted = demo.dataset.moving === "true"; opened = value;
      states.forEach((state, i) => { state.delay = interrupted ? 0 : (opened ? i * motion.openGap : (count - 1 - i) * motion.closeGap); state.elapsed = 0; state.fromOpacity = state.opacity; state.fromBlur = state.blur; });
    }
    focusIndex = value ? focus : -1;
    if (!value && buttons.includes(document.activeElement)) toggle.focus();
    toggle.setAttribute("aria-expanded", String(value));
    toggle.setAttribute("aria-label", value ? "关闭快捷操作" : "打开快捷操作");
    menu.inert = !value;
    buttons.forEach((button, i) => { button.tabIndex = value && i === 0 ? 0 : -1; });
    draw(); wake();
  }
  function focusAction(index) { buttons.forEach((button, i) => { button.tabIndex = i === index ? 0 : -1; }); buttons[index].focus(); }
  function close() { setOpen(false); toggle.focus(); }
  toggle.addEventListener("click", (event) => setOpen(!opened, event.detail === 0 && !opened ? 0 : -1));
  toggle.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowLeft") { event.preventDefault(); setOpen(true, event.key === "ArrowUp" || event.key === "ArrowLeft" ? count - 1 : 0); }
    else if (event.key === "Escape" && opened) { event.preventDefault(); close(); }
  });
  buttons.forEach((button, i) => {
    button.addEventListener("click", () => {
      demo.dataset.action = button.dataset.action;
      status.textContent = `已执行：${button.getAttribute("aria-label")}`;
      demo.dispatchEvent(new CustomEvent("radial-menu-action", { bubbles: true, composed: true, detail: { action: button.dataset.action } }));
      close();
    });
    button.addEventListener("keydown", (event) => {
      let next = i;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (i + 1) % count;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (i - 1 + count) % count;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = count - 1;
      else if (event.key === "Escape") { event.preventDefault(); close(); return; }
      else return;
      event.preventDefault(); focusIndex = next; draw();
    });
  });
  document.addEventListener("pointerdown", (event) => { const path = event.composedPath(); if (opened && !path.includes(toggle) && !buttons.some((button) => path.includes(button))) setOpen(false); });
  stage.addEventListener("focusout", (event) => { if (opened && !stage.contains(event.relatedTarget)) setOpen(false); });
  function syncMotion() { if (media.matches) settle(); else wake(); }
  media.addEventListener("change", syncMotion);
  function resize() {
    const rect = scope.rect(demo);
    stage.style.setProperty("--rm-scale", String(Math.min(rect.width / 960, rect.height / 960)));
    // Keep the trigger 40px from the host's right/bottom edge; the component
    // itself is a fixed-size square anchored to the viewport corner.
    const hostWidth = scope.element.clientWidth || rect.width;
    const pxScale = hostWidth / rect.width;
    const margin = 40 / pxScale;
    stage.style.left = `${rect.width - margin}px`;
    stage.style.top = `${rect.height - margin}px`;
    draw();
  }
  const observer = new ResizeObserver(resize); observer.observe(demo);
  function dispose() { if (destroyed) return; destroyed = true; cancelAnimationFrame(frame); cancelAnimationFrame(readyFrame); observer.disconnect(); optionObserver?.disconnect(); media.removeEventListener("change", syncMotion); }
  scope.addCleanup(dispose);
  optionObserver = new MutationObserver(syncMotion);
  optionObserver.observe(scope.element, { attributes: true, attributeFilter: ["data-reduced-motion"] });
  window.addEventListener("pagehide", dispose, { once: true });
  resize(); draw(); demo.dataset.moving = "false";
  readyFrame = requestAnimationFrame(() => { if (destroyed) return; demo.dataset.motionReady = "true"; document.body.dataset.motionReady = "true"; });

  scope.ready();
  return scope.controller;
}
