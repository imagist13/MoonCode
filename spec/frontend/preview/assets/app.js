/* =================================================================
   MoonBlog · Shared App JS
   - 主题切换（Dark/Light）
   - 移动端汉堡菜单
   - 当前路由高亮
   - 滚动淡入
   - Hero 字符逐字浮现
   - Magnetic hover
   - 阅读进度条
   - 代码块复制
   - Vanta.js Canvas 背景（three.js 生态）
================================================================= */

(function () {
  const html = document.documentElement;

  // ---------- Theme ----------
  const THEME_KEY = 'moonblog-theme';
  function applyTheme(dark) {
    html.classList.toggle('dark', dark);
    document.querySelectorAll('[data-theme-icon]').forEach((el) => {
      el.dataset.themeIcon === 'sun'
        ? (el.style.display = dark ? 'none' : 'inline-flex')
        : (el.style.display = dark ? 'inline-flex' : 'none');
    });
    // 通知 Vanta 重置颜色
    if (window.__vantaEffect && window.__vantaEffect.setOptions) {
      window.__vantaEffect.setOptions(getVantaOptions(dark));
    }
  }
  const stored = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(stored ? stored === 'dark' : prefersDark);

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    const nowDark = !html.classList.contains('dark');
    applyTheme(nowDark);
    localStorage.setItem(THEME_KEY, nowDark ? 'dark' : 'light');
  });

  // ---------- Mobile Nav ----------
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-mobile-open]');
    const closeBtn = e.target.closest('[data-mobile-close]');
    const menu = document.querySelector('.mobile-nav');
    if (!menu) return;
    if (openBtn) menu.classList.add('open');
    if (closeBtn) menu.classList.remove('open');
    if (e.target.closest('.mobile-nav a')) menu.classList.remove('open');
  });

  // ---------- Active route highlight ----------
  const currentPath = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav-link]').forEach((a) => {
    const target = a.getAttribute('href');
    if (!target) return;
    const targetFile = target.split('/').pop();
    if (targetFile === currentPath) a.classList.add('active');
  });

  // ---------- Scroll reveal ----------
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // ---------- Char reveal ----------
  document.querySelectorAll('.char-reveal').forEach((el) => {
    const text = el.dataset.text || el.textContent;
    el.innerHTML = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.transitionDelay = i * 30 + 'ms';
      el.appendChild(span);
    });
    setTimeout(() => el.classList.add('in'), 100);
  });

  // ---------- Magnetic hover ----------
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ---------- Reading progress ----------
  const progress = document.querySelector('.reading-progress');
  if (progress) {
    const article = document.querySelector('[data-article]');
    const update = () => {
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const done = -rect.top;
      const pct = Math.min(100, Math.max(0, (done / total) * 100));
      progress.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ---------- Code copy ----------
  document.querySelectorAll('.code-block').forEach((pre) => {
    const btn = document.createElement('button');
    btn.className = 'code-copy';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.innerText || pre.innerText;
      try {
        await navigator.clipboard.writeText(code);
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 1600);
      } catch (_) {}
    });
    pre.appendChild(btn);
  });

  // ---------- 能量光晕球 + 星环 + 脉冲扩散 ----------
  function initOrbAura(container) {
    if (!container) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'orb-aura-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen;';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let w, h, cx, cy, R, dpr;
    // 星环粒子
    const rings = [
      { r: 1.0, count: 80, speed: 0.0035, tilt: 0.35, size: 2.4 },
      { r: 1.15, count: 110, speed: -0.0022, tilt: -0.5, size: 2.0 },
      { r: 1.35, count: 140, speed: 0.0015, tilt: 0.25, size: 1.6 },
    ];
    // 脉冲波
    const pulses = [];
    // 火花小粒子
    const sparks = [];
    // 鼠标状态
    const mouse = { x: -9999, y: -9999, active: false, hover: 0 /* 0-1 平滑 */ };

    function resize() {
      dpr = window.devicePixelRatio || 1;
      w = canvas.width = container.offsetWidth * dpr;
      h = canvas.height = container.offsetHeight * dpr;
      canvas.style.width = container.offsetWidth + 'px';
      canvas.style.height = container.offsetHeight + 'px';
      cx = w / 2;
      cy = h / 2;
      R = Math.min(w, h) * 0.35; // 球体半径（放大更明显）
    }
    resize();
    window.addEventListener('resize', resize);

    // 每 2s 一个脉冲波
    setInterval(() => {
      pulses.push({ r: R * 0.9, a: 0.6, w: 2 });
    }, 2000);

    // 定时喷射火花（更密集）
    setInterval(() => {
      const ang = Math.random() * Math.PI * 2;
      const spd = (0.8 + Math.random() * 1.2) * dpr;
      sparks.push({
        x: cx, y: cy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 1,
      });
    }, 60);

    // ---- 鼠标交互（挂 window 以穿透上层内容） ----
    window.addEventListener('mousemove', e => {
      const rect = container.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * dpr;
      mouse.y = (e.clientY - rect.top) * dpr;
      // 是否在 Hero 区域内
      mouse.active = e.clientX >= rect.left && e.clientX <= rect.right &&
                     e.clientY >= rect.top && e.clientY <= rect.bottom;

      // 悬停在球上时喷射额外火花
      if (mouse.active) {
        const d = Math.hypot(mouse.x - cx, mouse.y - cy);
        if (d < R * 1.4 && Math.random() > 0.55) {
          const ang = Math.atan2(mouse.y - cy, mouse.x - cx) + (Math.random() - 0.5) * 0.8;
          const spd = (1.5 + Math.random() * 2.5) * dpr;
          sparks.push({
            x: mouse.x + (Math.random() - .5) * 10 * dpr,
            y: mouse.y + (Math.random() - .5) * 10 * dpr,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            life: 1,
          });
        }
      }
    });

    // 点击：在球范围内触发爆炸
    window.addEventListener('click', e => {
      const rect = container.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right &&
                     e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) return;
      const mx = (e.clientX - rect.left) * dpr;
      const my = (e.clientY - rect.top) * dpr;
      const d = Math.hypot(mx - cx, my - cy);
      if (d < R * 1.8) {
        // 三层爆炸脉冲
        pulses.push({ r: R * 0.4, a: 0.9, w: 3 });
        pulses.push({ r: R * 0.6, a: 0.7, w: 2 });
        setTimeout(() => pulses.push({ r: R * 0.4, a: 0.6, w: 2 }), 150);
        // 大量火花
        for (let i = 0; i < 40; i++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = (2 + Math.random() * 4) * dpr;
          sparks.push({
            x: cx, y: cy,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            life: 1,
          });
        }
      }
    });

    let t = 0;
    function draw() {
      const dark = html.classList.contains('dark');
      ctx.clearRect(0, 0, w, h);
      t += 1;

      // 计算鼠标是否在球区域内（用于平滑 hover 系数）
      let mdx = 0, mdy = 0, mdist = 9999;
      if (mouse.active) {
        mdx = mouse.x - cx;
        mdy = mouse.y - cy;
        mdist = Math.hypot(mdx, mdy);
      }
      const inRange = mouse.active && mdist < R * 2.0;
      mouse.hover += ((inRange ? 1 : 0) - mouse.hover) * 0.12;

      // 球体受鼠标吸引产生的偏移（往鼠标方向轻微跟随）
      let attractX = 0, attractY = 0;
      if (mouse.hover > 0.02 && mdist > 0) {
        const pull = Math.min(1, R / (mdist + 40)) * mouse.hover;
        attractX = (mdx / mdist) * R * 0.15 * pull;
        attractY = (mdy / mdist) * R * 0.15 * pull;
      }
      const ccx = cx + attractX;
      const ccy = cy + attractY;

      // 1) 中心大光晕（径向渐变，随 hover 变强）
      const glowR = R * (1.8 + mouse.hover * 0.4);
      const glow = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, glowR);
      const boost = 1 + mouse.hover * 0.6;
      if (dark) {
        glow.addColorStop(0, `rgba(196,181,253,${.55 * boost})`);
        glow.addColorStop(0.35, `rgba(139,92,246,${.30 * boost})`);
        glow.addColorStop(0.7, `rgba(236,72,153,${.10 * boost})`);
        glow.addColorStop(1, 'rgba(236,72,153,0)');
      } else {
        glow.addColorStop(0, `rgba(167,139,250,${.45 * boost})`);
        glow.addColorStop(0.35, `rgba(139,92,246,${.22 * boost})`);
        glow.addColorStop(0.7, `rgba(219,39,119,${.08 * boost})`);
        glow.addColorStop(1, 'rgba(219,39,119,0)');
      }
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // 2) 星环（鼠标越近，转速越快）
      const speedBoost = 1 + mouse.hover * 3;
      rings.forEach((ring, ri) => {
        const rot = t * ring.speed * speedBoost;
        for (let i = 0; i < ring.count; i++) {
          const a = (i / ring.count) * Math.PI * 2 + rot;
          const rx = R * ring.r * Math.cos(a);
          const ry = R * ring.r * Math.sin(a) * ring.tilt;
          let x = ccx + rx;
          let y = ccy + ry + Math.sin(a * 3 + t * 0.02) * 2 * dpr;

          // 鼠标斥力：粒子被强力推开
          if (mouse.active) {
            const dxp = x - mouse.x, dyp = y - mouse.y;
            const dp = Math.hypot(dxp, dyp);
            const range = R * 0.8;
            if (dp < range && dp > 0.1) {
              const f = Math.pow(1 - dp / range, 2) * 45 * dpr;
              x += (dxp / dp) * f;
              y += (dyp / dp) * f;
            }
          }

          // z-based 亮度：靠前的更亮
          const z = Math.sin(a);
          const alpha = (0.35 + z * 0.55) * (ri === 0 ? 1 : 0.7) * (1 + mouse.hover * 0.4);
          if (alpha <= 0.05) continue;

          // 颜色随角度过渡：紫 → 粉
          const hue = 270 + Math.sin(a + t * 0.01) * 30;
          ctx.fillStyle = dark
            ? `hsla(${hue}, 90%, 75%, ${alpha})`
            : `hsla(${hue}, 85%, 55%, ${alpha})`;

          const size = ring.size * dpr * (0.7 + z * 0.5) * (1 + mouse.hover * 0.5);
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();

          // 每 6 个粒子留一条流星尾巴（前排）
          if (z > 0.6 && i % 6 === 0) {
            ctx.strokeStyle = dark
              ? `hsla(${hue}, 90%, 80%, ${alpha * 0.55})`
              : `hsla(${hue}, 85%, 60%, ${alpha * 0.55})`;
            ctx.lineWidth = 1 * dpr;
            ctx.beginPath();
            ctx.moveTo(x, y);
            const ap = a - 0.15;
            const px = ccx + R * ring.r * Math.cos(ap);
            const py = ccy + R * ring.r * Math.sin(ap) * ring.tilt;
            ctx.lineTo(px, py);
            ctx.stroke();
          }
        }
      });

      // 3) 脉冲波
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.r += 1.2 * dpr;
        p.a *= 0.985;
        if (p.a < 0.02) { pulses.splice(i, 1); continue; }
        ctx.strokeStyle = dark
          ? `rgba(196,181,253,${p.a})`
          : `rgba(139,92,246,${p.a})`;
        ctx.lineWidth = (p.w || 1.5) * dpr;
        ctx.beginPath();
        ctx.arc(ccx, ccy, p.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4) 火花
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx; s.y += s.vy;
        s.vx *= 0.985; s.vy *= 0.985;
        s.life -= 0.008;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = dark
          ? `rgba(240,171,252,${s.life})`
          : `rgba(219,39,119,${s.life * 0.85})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.2 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5) 中心核（呼吸 + 鼠标增亮）
      const pulse = 0.85 + Math.sin(t * 0.04) * 0.15 + mouse.hover * 0.25;
      const coreGrad = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, R * 0.35 * pulse);
      const coreA = 0.7 + mouse.hover * 0.3;
      coreGrad.addColorStop(0, dark ? `rgba(255,255,255,${coreA + .15})` : `rgba(255,255,255,${coreA})`);
      coreGrad.addColorStop(0.4, dark ? 'rgba(196,181,253,.5)' : 'rgba(167,139,250,.4)');
      coreGrad.addColorStop(1, 'rgba(167,139,250,0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(ccx, ccy, R * 0.4 * (1 + mouse.hover * 0.15), 0, Math.PI * 2);
      ctx.fill();

      // 6) 鼠标光标处的能量光斑
      if (mouse.hover > 0.05) {
        const cursorGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, R * 0.35);
        cursorGrad.addColorStop(0, `rgba(240,171,252,${.6 * mouse.hover})`);
        cursorGrad.addColorStop(1, 'rgba(240,171,252,0)');
        ctx.fillStyle = cursorGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, R * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      window.__auraRAF = requestAnimationFrame(draw);
    }
    draw();
  }

  // ---------- Code Rain Overlay (Matrix-like)：给指定容器叠一层代码雨 ----------
  function initCodeRain(container) {
    if (!container) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'code-rain-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen;opacity:.6;';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const chars = '01{}[]()<>/=+-*&|!?;:.,#$@ABCDEFGHIJKLMNOPQRSTUVWXYZfunctionconstletreturnimportexportclassifelseasync';
    let cols, drops, w, h, fontSize = 14;

    function resize() {
      w = canvas.width = container.offsetWidth * devicePixelRatio;
      h = canvas.height = container.offsetHeight * devicePixelRatio;
      canvas.style.width = container.offsetWidth + 'px';
      canvas.style.height = container.offsetHeight + 'px';
      cols = Math.floor(w / (fontSize * devicePixelRatio));
      drops = Array.from({ length: cols }, () => Math.random() * -50);
    }
    resize();
    window.addEventListener('resize', resize);

    function draw() {
      const dark = html.classList.contains('dark');
      // 淡出前一帧（拖尾）
      ctx.fillStyle = dark ? 'rgba(9,9,11,.08)' : 'rgba(250,250,249,.10)';
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize * devicePixelRatio}px "JetBrains Mono", monospace`;

      for (let i = 0; i < cols; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize * devicePixelRatio;
        const y = drops[i] * fontSize * devicePixelRatio;

        // 头部字符更亮（violet），尾部渐暗
        if (Math.random() > 0.975) {
          ctx.fillStyle = dark ? '#e9d5ff' : '#7c3aed';
        } else {
          ctx.fillStyle = dark ? 'rgba(167,139,250,.85)' : 'rgba(124,58,237,.65)';
        }
        ctx.fillText(char, x, y);

        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.6;
      }
      window.__codeRainRAF = requestAnimationFrame(draw);
    }
    draw();
  }

  // ---------- 交互式网络粒子（跟随鼠标 + 连线） ----------
  function initNetParticles(container) {
    if (!container) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'net-particles-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [], w, h, mouse = { x: -9999, y: -9999 };

    function resize() {
      w = canvas.width = container.offsetWidth * devicePixelRatio;
      h = canvas.height = container.offsetHeight * devicePixelRatio;
      canvas.style.width = container.offsetWidth + 'px';
      canvas.style.height = container.offsetHeight + 'px';
      const count = Math.min(80, Math.floor((container.offsetWidth * container.offsetHeight) / 12000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.4 * devicePixelRatio,
        r: (1 + Math.random() * 1.5) * devicePixelRatio,
      }));
    }
    resize();
    window.addEventListener('resize', resize);

    container.addEventListener('mousemove', e => {
      const rect = container.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * devicePixelRatio;
      mouse.y = (e.clientY - rect.top) * devicePixelRatio;
    });
    container.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

    function draw() {
      const dark = html.classList.contains('dark');
      ctx.clearRect(0, 0, w, h);
      const maxDist = 120 * devicePixelRatio;
      const mouseDist = 180 * devicePixelRatio;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // 鼠标吸引
        const mdx = mouse.x - p.x, mdy = mouse.y - p.y;
        const md = Math.hypot(mdx, mdy);
        if (md < mouseDist) {
          const f = (1 - md / mouseDist) * 0.4;
          p.x += (mdx / md) * f;
          p.y += (mdy / md) * f;
        }

        // 粒子点
        ctx.fillStyle = dark ? 'rgba(167,139,250,.9)' : 'rgba(124,58,237,.85)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // 连线
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = q.x - p.x, dy = q.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * (dark ? 0.35 : 0.28);
            ctx.strokeStyle = dark ? `rgba(167,139,250,${alpha})` : `rgba(124,58,237,${alpha})`;
            ctx.lineWidth = devicePixelRatio;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // 鼠标连线（更亮）
        if (md < mouseDist) {
          const alpha = (1 - md / mouseDist) * (dark ? 0.7 : 0.55);
          ctx.strokeStyle = dark ? `rgba(232,121,249,${alpha})` : `rgba(219,39,119,${alpha})`;
          ctx.lineWidth = 1.5 * devicePixelRatio;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
      window.__netRAF = requestAnimationFrame(draw);
    }
    draw();
  }

  // ---------- Vanta.js Canvas Background ----------
  function getVantaOptions(dark) {
    return {
      color: dark ? 0xc4b5fd : 0x8b5cf6,
      color2: dark ? 0xf0abfc : 0xec4899,
      backgroundColor: dark ? 0x09090b : 0xfafaf9,
      size: 1.5,
      points: 14,
      maxDistance: 30,
      spacing: 15,
    };
  }
  function initVanta() {
    const el = document.querySelector('[data-vanta="globe"]');
    if (el && window.VANTA && window.VANTA.GLOBE) {
      window.__vantaEffect = window.VANTA.GLOBE({
        el,
        THREE: window.THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        ...getVantaOptions(html.classList.contains('dark')),
      });
      // 叠加：能量光晕层 + 代码雨 + 网络粒子（跟随鼠标）
      initOrbAura(el);
      initCodeRain(el);
      initNetParticles(el);
      return;
    }
    const waves = document.querySelector('[data-vanta="waves"]');
    if (waves && window.VANTA && window.VANTA.WAVES) {
      window.__vantaEffect = window.VANTA.WAVES({
        el: waves,
        THREE: window.THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        color: html.classList.contains('dark') ? 0x1e1b4b : 0x7c3aed,
        shininess: 40,
        waveHeight: 18,
        waveSpeed: 0.85,
        zoom: 0.9,
      });
    }
    const net = document.querySelector('[data-vanta="net"]');
    if (net && window.VANTA && window.VANTA.NET) {
      window.__vantaEffect = window.VANTA.NET({
        el: net,
        THREE: window.THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        points: 9,
        maxDistance: 24,
        spacing: 18,
        color: html.classList.contains('dark') ? 0xa78bfa : 0x7c3aed,
        backgroundColor: html.classList.contains('dark') ? 0x09090b : 0xfafaf9,
      });
    }
  }
  // 等 Vanta / Three 加载完
  const tryInit = () => {
    if (window.VANTA && window.THREE) initVanta();
    else setTimeout(tryInit, 100);
  };
  tryInit();
})();
