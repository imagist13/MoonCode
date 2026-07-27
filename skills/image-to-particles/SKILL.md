---
name: "image-to-particles"
description: "读取图片，生成单文件 HTML 粒子艺术页：逐像素还原图片，内置 8 种待机效果（呼吸/波浪/闪烁/涡旋/雨滴/轨道/脉冲/噪点）与 8 种转场（爆散/涡旋/波扫/内爆/雨落/像素溶解/穿越/闪现），支持多图轮播与 UI 切换。当用户提供图片并要求粒子效果、粒子复刻、粒子画廊、图片转场、粒子艺术页时立即调用。"
---

# Image → Particles Engine（粒子画廊引擎）

把用户的图片转换为**单文件、零依赖**的 Canvas 粒子页面。三个层级：

1. **核心引擎**（必备）：图片 → 像素采样 → 粒子数组 → 弹簧物理 → 鼠标交互
2. **待机效果**（Effect）：图片成型后粒子持续进行的微动画
3. **转场效果**（Transition）：多图之间粒子从 A 形态飞到 B 形态的编排

---

## 触发条件

- "把图片做成粒子效果 / 粒子复刻 / 粒子画廊"
- "给这些图片做粒子转场轮播"
- "image to particles / particle gallery / particle transition"
- 提供图片 + HTML/canvas/前端页面 关键词

## 输入参数

| 参数 | 说明 | 默认 |
|---|---|---|
| 图片路径 | 本地绝对路径（可多张） | 必填 |
| `sampleGap` | 采样间距 px，越小越精细 | `3` |
| `particleSize` | 粒子半径 | `1.6` |
| `maxParticles` | 粒子上限（防爆） | `20000` |
| `bgColor` | 背景 | `#0a0a0f` |
| `effect` | 默认待机效果 | `breathe` |
| `transition` | 默认转场 | `scatter` |
| `interval` | 轮播间隔 ms（多图时） | `5000` |
| `ui` | 是否显示效果/转场切换栏 | `true` |

## 工作流程

### 1. 图片编码
PowerShell：
```powershell
$bytes = [IO.File]::ReadAllBytes("<path>")
$b64 = [Convert]::ToBase64String($bytes)
"data:image/jpeg;base64,$b64" | Out-File -Encoding ascii -NoNewline out.txt
```
然后**模板 + 占位符替换**注入（不要手写超长 base64 进 Write）：
```powershell
$tpl = Get-Content template.html -Raw
$tpl = $tpl.Replace('__IMG_DATA_URI__', $b64)
Set-Content out.html $tpl -Encoding UTF8
```
多图时注入 `__IMG_LIST__`（JSON 数组）。

### 2. 采样核心（所有模式共用）

```js
function sample(img, targetW, gap) {
  const off = document.createElement('canvas');
  const scale = targetW / img.width;
  off.width = img.width * scale; off.height = img.height * scale;
  const octx = off.getContext('2d');
  octx.drawImage(img, 0, 0, off.width, off.height);
  const d = octx.getImageData(0, 0, off.width, off.height).data;
  const pts = [];
  for (let y = 0; y < off.height; y += gap)
    for (let x = 0; x < off.width; x += gap) {
      const i = (y * off.width + x) * 4;
      if (d[i+3] < 20) continue;
      pts.push({ x, y, color: `rgba(${d[i]},${d[i+1]},${d[i+2]},${(d[i+3]/255).toFixed(2)})` });
    }
  return { pts, w: off.width, h: off.height };
}
```

粒子模型：`{ x, y, tx, ty, vx, vy, color, seed }`。物理：`v += (t-p)*K; v*=D; p+=v`（K=0.055, D=0.82）。鼠标斥力半径 90、强度 4.5。

**多图粒子数对齐**：以采样点最多的图为准，粒子数不足时**复用已有粒子**（取模循环指派目标点）。

### 3. 待机效果库（Effect）

图片成型后每帧对粒子渲染做偏移/颜色调制（不改 `tx/ty`）：

| 名称 | 行为 | 实现要点 |
|---|---|---|
| `none` | 静止 | 直接渲染 |
| `breathe` | 整体透明度/半径呼吸 | `r *= 1 + sin(t*0.03 + seed)*0.35` |
| `wave` | 横向正弦波浪穿过 | `dy = sin(x*0.02 + t*0.05) * 8` |
| `twinkle` | 随机闪烁 | `alpha *= 0.5 + 0.5*sin(t*0.1 + seed*10)` |
| `vortex` | 绕中心缓慢旋转 | 每帧把渲染坐标绕中心转 `0.002` 弧度 |
| `rain` | 持续下落循环 | `y += speed; y > H 时回到顶部`，脱离弹簧 |
| `pulse` | 中心向外同心波 | `dy = sin(dist(cx)*0.02 - t*0.08) * 6` |
| `noise` | 微幅随机抖动 | `dx = (rand-0.5)*2`，每帧重取 |

### 4. 转场效果库（Transition）

A→B 切换的两阶段编排（每粒子带 `delay` 实现错峰）：

| 名称 | 退出阶段 | 进入阶段 | 错峰依据 |
|---|---|---|---|
| `scatter` | 向外爆散 | 弹簧汇聚 | 无 |
| `swirl` | 绕中心旋转 360° | 从新位置旋入 | 按角度 |
| `wave-wipe` | 原样停留 | 左→右逐列点亮 | `x / w * 1500ms` |
| `implode` | 吸向中心 | 从中心炸出 | 按到中心距离 |
| `rain-fall` | 向下落出屏 | 从顶部落入 | 随机 |
| `pixel-dissolve` | 原地淡出 | 随机顺序浮现 | `seed * 1200ms` |
| `warp` | 沿 z 轴放大穿越 | 从远处缩小落位 | 随机 |
| `flash` | 白闪一帧 | 直接切换 + 错峰弹入 | 无 |

**通用实现模式**：
```js
function startTransition(nextTargets, type) {
  particles.forEach((p, i) => {
    const nt = nextTargets[i % nextTargets.length];
    p.delay = staggerBy(type, p);          // 错峰延迟
    p.phase = 'exit'; p.phaseT = 0;
    p.next = { tx: nt.x, ty: nt.y, color: nt.color };
    exitVelocity(type, p);                 // 按类型给初速度
  });
}
// 每帧：phaseT++ > delay 后执行 exit 动画 N 帧 → 切到 enter（换 tx/ty/color）→ 弹簧归位
```

### 5. 多图轮播

- `setInterval(() => transitionTo(nextImg, transition), interval)`
- 同一张图可用 `ctx.filter = 'hue-rotate(120deg)'` 生成色相变体充当多图
- 底部 UI 栏：效果按钮组 + 转场按钮组，点击即时切换

### 6. 输出

- 单文件 HTML 写到图片同目录：`<name>-particles.html` 或 `particles-gallery.html`
- `python -m http.server` 启动预览 + `OpenPreview`

## 质量要求

1. 颜色必须来自原图像素（不要单色化）
2. base64 内嵌，零外部依赖
3. 粒子上限保护（`maxParticles`），超大图自动降采样
4. 转场期间暂停待机效果，完成 1s 后恢复
5. resize 时重建目标点
6. 转场用**错峰延迟**制造流动感，不要所有粒子同时动

## 反例

- ❌ `<img>` 加粒子背景冒充粒子复刻
- ❌ 转场 = 直接换图（没有粒子编排）
- ❌ 所有粒子同一帧开始转场（机械感）
- ❌ base64 直接手写粘贴进 Write（用模板替换注入）

## 参考实现

完整可运行的引擎样例见项目 `assets/particles-gallery.html`（含全部效果与转场 + UI 切换栏）。
