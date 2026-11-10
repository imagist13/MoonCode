#!/usr/bin/env bun
/**
 * Moon Blog 演示 GIF 录制脚本
 *
 * 用 Playwright 录制一条完整动线：首页 → 文章详情（目录小船）→ 分类 →
 * 留言板 → 登录页 → 蜘蛛点唱机换歌 → 深色模式，再用 ffmpeg 转成
 * README 顶部的 docs/screenshots/demo.gif。
 *
 * 使用前先启动站点：
 *   cd frontend
 *   bun run mock    # 终端 1
 *   bun run dev     # 终端 2
 *
 * 然后回到仓库根目录执行：
 *   bun scripts/demo.mjs
 */

import { spawnSync } from "node:child_process";
import { access, mkdir, mkdtemp, readdir, rm, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontendRequire = createRequire(path.join(ROOT, "frontend", "package.json"));
const { chromium } = frontendRequire("playwright");

const DEFAULT_OPTS = {
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  out: path.join(ROOT, "docs", "screenshots", "demo.gif"),
  width: 1280,
  height: 720,
  gifWidth: 960,
  fps: 9,
  colors: 128,
  timeout: 30000,
  headed: false,
  keepVideo: false,
  ffmpeg: process.env.FFMPEG_PATH || null,
};

/* ------------------------------------------------------------------ */
/* CLI                                                                 */
/* ------------------------------------------------------------------ */

function printHelp() {
  console.log(`
Moon Blog 演示 GIF

用法：
  bun scripts/demo.mjs [选项]

示例：
  bun scripts/demo.mjs
  bun scripts/demo.mjs --gif-width 800 --fps 8
  bun scripts/demo.mjs --keep-video --out .tmp/demo.gif

选项：
  --base-url <url>   站点地址，默认 $BASE_URL 或 http://localhost:3000
  --out <file>       输出 GIF，默认 docs/screenshots/demo.gif
  --width <px>       录制视口宽度，默认 1280
  --height <px>      录制视口高度，默认 720
  --gif-width <px>   GIF 宽度，默认 960
  --fps <n>          GIF 帧率，默认 9
  --colors <n>       GIF 调色板颜色数，默认 128
  --ffmpeg <path>    ffmpeg 可执行文件，默认 $FFMPEG_PATH 或 PATH 中的 ffmpeg
  --keep-video       保留中间 .webm 文件
  --headed           显示浏览器窗口，便于调试
  --timeout <ms>     单步超时，默认 30000
  -h, --help         显示帮助

环境变量：
  BASE_URL            站点地址
  FFMPEG_PATH         ffmpeg 可执行文件
  CHROMIUM_EXECUTABLE_PATH  手动指定 Chromium 可执行文件

说明：
  脚本依赖 frontend/node_modules 里的 Playwright 和系统 ffmpeg。
  录制内容来自当前运行中的 Mock 数据；想恢复演示数据，重启 bun run mock 即可。
`);
}

function parseArgs(argv) {
  const opts = { ...DEFAULT_OPTS };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const read = () => {
      const value = argv[++i];
      if (value === undefined) throw new Error(`参数 ${arg} 缺少值`);
      return value;
    };

    switch (arg) {
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
        break;
      case "--base-url":
        opts.baseUrl = read().replace(/\/+$/, "");
        break;
      case "--out": {
        const value = read();
        opts.out = path.isAbsolute(value) ? value : path.resolve(ROOT, value);
        break;
      }
      case "--width":
        opts.width = Number(read());
        break;
      case "--height":
        opts.height = Number(read());
        break;
      case "--gif-width":
        opts.gifWidth = Number(read());
        break;
      case "--fps":
        opts.fps = Number(read());
        break;
      case "--colors":
        opts.colors = Number(read());
        break;
      case "--ffmpeg":
        opts.ffmpeg = read();
        break;
      case "--keep-video":
        opts.keepVideo = true;
        break;
      case "--headed":
        opts.headed = true;
        break;
      case "--timeout":
        opts.timeout = Number(read());
        break;
      default:
        throw new Error(`未知参数 ${arg}，使用 --help 查看用法`);
    }
  }

  for (const key of ["width", "height", "gifWidth", "fps", "colors", "timeout"]) {
    if (!Number.isFinite(opts[key]) || opts[key] <= 0) {
      throw new Error(`参数 --${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)} 必须是正数`);
    }
  }

  return opts;
}

/* ------------------------------------------------------------------ */
/* 浏览器                                                              */
/* ------------------------------------------------------------------ */

async function launchBrowser(opts) {
  const candidates = [];
  if (process.env.CHROMIUM_EXECUTABLE_PATH) {
    candidates.push(process.env.CHROMIUM_EXECUTABLE_PATH);
  }
  const detected = await findChromiumExecutable();
  if (detected) candidates.push(detected);
  candidates.push(null); // 交给 Playwright 自己解析

  let lastError;
  for (const executablePath of candidates) {
    try {
      const browser = await chromium.launch({
        headless: !opts.headed,
        executablePath: executablePath || undefined,
      });
      if (executablePath) console.log(`浏览器：${executablePath}`);
      return browser;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `无法启动 Chromium：${lastError?.message ?? "未知错误"}\n` +
      "可尝试在 frontend 目录执行：bunx playwright install chromium",
  );
}

async function findChromiumExecutable() {
  const roots = process.env.PLAYWRIGHT_BROWSERS_PATH
    ? [process.env.PLAYWRIGHT_BROWSERS_PATH]
    : [playwrightCacheRoot()];

  for (const root of roots) {
    let entries;
    try {
      entries = await readdir(root);
    } catch {
      continue;
    }

    const dirs = entries
      .filter((entry) => /^chromium-\d+$/.test(entry))
      .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));

    for (const dir of dirs) {
      for (const candidate of chromiumCandidates(path.join(root, dir))) {
        try {
          await access(candidate);
          return candidate;
        } catch {
          // 尝试下一个
        }
      }
    }
  }

  return null;
}

function playwrightCacheRoot() {
  if (process.platform === "win32") {
    return path.join(
      process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"),
      "ms-playwright",
    );
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Caches", "ms-playwright");
  }
  return path.join(os.homedir(), ".cache", "ms-playwright");
}

function chromiumCandidates(dir) {
  if (process.platform === "win32") {
    return [
      path.join(dir, "chrome-win64", "chrome.exe"),
      path.join(dir, "chrome-win", "chrome.exe"),
    ];
  }
  if (process.platform === "darwin") {
    return [
      path.join(dir, "chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"),
      path.join(dir, "chrome-mac-arm64", "Chromium.app", "Contents", "MacOS", "Chromium"),
    ];
  }
  return [
    path.join(dir, "chrome-linux64", "chrome"),
    path.join(dir, "chrome-linux", "chrome"),
  ];
}

/* ------------------------------------------------------------------ */
/* 录制                                                                */
/* ------------------------------------------------------------------ */

async function hideChrome(page) {
  await page.addStyleTag({
    content: `* { scroll-behavior: auto !important; }`,
  });

  // Next.js 开发模式左下角的调试按钮藏在 shadow root 里
  await page.evaluate(() => {
    for (const portal of document.querySelectorAll("nextjs-portal")) {
      const root = portal.shadowRoot;
      if (!root || root.querySelector("style[data-screenshot-hide]")) continue;
      const style = document.createElement("style");
      style.setAttribute("data-screenshot-hide", "true");
      style.textContent = "#devtools-indicator { display: none !important; }";
      root.appendChild(style);
    }
  });
}

async function scrollTo(page, top) {
  await page.evaluate((y) => {
    window.scrollTo({ top: y, behavior: "smooth" });
  }, top);
}

/** 收起状态的播放器会在左下角露出一条边，非播放器段落先藏起来 */
async function setPlayerHidden(page, hidden) {
  await page.evaluate((hide) => {
    const id = "demo-player-visibility";
    const existing = document.getElementById(id);
    if (!hide) {
      existing?.remove();
      return;
    }
    if (existing) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = ".music-player { display: none !important; }";
    document.head.appendChild(style);
  }, hidden);
}

async function clickNav(page, href, name, opts) {
  console.log(`打开${name}`);
  const link = page.locator(`header a[href="${href}"]`).first();
  await link.waitFor({ state: "visible", timeout: opts.timeout });
  await link.click();
  await page.waitForURL(
    (url) => (typeof url === "string" ? new URL(url) : url).pathname === href,
    { timeout: opts.timeout },
  );
}

async function openPlayer(page) {
  console.log("打开蜘蛛点唱机");
  const trigger = page.getByRole("button", { name: "展开蜘蛛点唱机" });
  await trigger.waitFor({ state: "visible", timeout: 15000 });
  // 展开按钮被播放器面板压住，直接触发 DOM 点击
  await trigger.evaluate((element) => element.click());
  await page
    .locator('[aria-label="蜘蛛点唱机"]')
    .first()
    .waitFor({ state: "visible", timeout: 15000 });
}

async function record(page, opts) {
  const started = Date.now();
  const pause = (ms) => page.waitForTimeout(ms);

  console.log("首页");
  await page.goto(`${opts.baseUrl}/`, { waitUntil: "domcontentloaded", timeout: opts.timeout });
  await page.waitForLoadState("load").catch(() => {});
  await page.evaluate(async () => {
    try {
      await document.fonts.ready;
    } catch {}
  });
  await pause(900);
  await hideChrome(page);
  await setPlayerHidden(page, true);
  await pause(1100);

  console.log("滚动到文章列表");
  await scrollTo(page, 720);
  await pause(1400);

  console.log("打开文章详情");
  const card = page.locator('#article-list-wrap a[href^="/articles/"]').first();
  await card.waitFor({ state: "visible", timeout: opts.timeout });
  await card.click();
  await page.waitForURL((url) => /^\/articles\/\d+$/.test(url.pathname), {
    timeout: opts.timeout,
  });
  await pause(1800);

  console.log("滚动到目录小船");
  await scrollTo(page, 640);
  await pause(1700);

  await clickNav(page, "/categories", "分类页", opts);
  await pause(1500);

  await clickNav(page, "/message", "留言板", opts);
  await pause(1600);

  await clickNav(page, "/admin/login", "登录页", opts);
  await pause(2300);

  console.log("返回首页");
  const backHome = page.getByRole("link", { name: /返回首页/ }).first();
  await backHome.click();
  await page.waitForURL(
    (url) => (typeof url === "string" ? new URL(url) : url).pathname === "/",
    { timeout: opts.timeout },
  );
  await pause(1200);

  await setPlayerHidden(page, false);
  await pause(400);
  await openPlayer(page);
  await pause(1600);

  console.log("蜘蛛换歌");
  const nextTrack = page.locator('[data-action="next"]').first();
  await nextTrack.waitFor({ state: "visible", timeout: 15000 });
  await nextTrack.click({ force: true });
  await pause(3000);

  console.log("关闭点唱机");
  await page.getByRole("button", { name: "关闭展开播放器" }).click();
  await pause(700);

  console.log("切换深色主题");
  const toggle = page.locator(".pixel-switch").first();
  if (await toggle.count()) {
    await toggle.click({ force: true }).catch(() => {});
    await pause(1800);
  } else {
    console.log("未找到主题切换按钮，跳过这一步");
  }

  console.log(`录制完成，用时 ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

/* ------------------------------------------------------------------ */
/* 转 GIF                                                              */
/* ------------------------------------------------------------------ */

function findFfmpeg(explicit) {
  const candidates = [explicit, "ffmpeg"].filter(Boolean);
  if (process.platform === "win32") {
    candidates.push("D:/compiler/Anaconda3/Library/bin/ffmpeg.exe");
  }

  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["-version"], { stdio: "ignore" });
    if (!result.error && result.status === 0) return candidate;
  }
  return null;
}

function toGif(ffmpeg, videoPath, opts) {
  const filter = [
    `fps=${opts.fps}`,
    `scale=${opts.gifWidth}:-1:flags=lanczos`,
    "split[s0][s1]",
    `[s0]palettegen=max_colors=${opts.colors}:stats_mode=diff[p]`,
    "[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle",
  ].join(",");

  const result = spawnSync(
    ffmpeg,
    ["-y", "-i", videoPath, "-vf", filter, "-loop", "0", opts.out],
    { stdio: "inherit" },
  );
  if (result.status !== 0) {
    throw new Error(`ffmpeg 转换失败（退出码 ${result.status}）`);
  }
}

/* ------------------------------------------------------------------ */
/* 主流程                                                              */
/* ------------------------------------------------------------------ */

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const ffmpeg = findFfmpeg(opts.ffmpeg);
  if (!ffmpeg) {
    throw new Error("未找到 ffmpeg，请安装后用 --ffmpeg 或环境变量 FFMPEG_PATH 指定");
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "moon-demo-"));
  await mkdir(path.dirname(opts.out), { recursive: true });

  const browser = await launchBrowser(opts);
  let videoFile;
  try {
    const context = await browser.newContext({
      viewport: { width: opts.width, height: opts.height },
      locale: "zh-CN",
      timezoneId: "Asia/Shanghai",
      colorScheme: "light",
      recordVideo: { dir: tempDir, size: { width: opts.width, height: opts.height } },
    });
    await context.addInitScript(() => {
      try {
        localStorage.setItem("theme", "light");
      } catch {}
    });

    const page = await context.newPage();
    page.setDefaultTimeout(opts.timeout);

    await record(page, opts);

    const video = page.video();
    await context.close();
    if (!video) throw new Error("没有拿到录制的视频");
    videoFile = path.join(tempDir, "demo.webm");
    await video.saveAs(videoFile);
  } finally {
    await browser.close();
  }

  console.log("转换为 GIF");
  toGif(ffmpeg, videoFile, opts);

  if (opts.keepVideo) {
    const kept = opts.out.replace(/\.gif$/i, ".webm");
    await import("node:fs/promises").then((fs) => fs.copyFile(videoFile, kept));
    console.log(`视频：${path.relative(ROOT, kept)}`);
  }
  await rm(tempDir, { recursive: true, force: true });

  const { size } = await stat(opts.out);
  console.log(`GIF：${path.relative(ROOT, opts.out)}（${(size / 1024 / 1024).toFixed(2)} MB）`);
  if (size > 10 * 1024 * 1024) {
    console.log("提示：文件超过 10 MB，可调低 --gif-width / --fps / --colors 后重录");
  }
}

main().catch((error) => {
  console.error(`\n失败：${error.message}`);
  process.exit(1);
});
