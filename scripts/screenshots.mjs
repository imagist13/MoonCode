#!/usr/bin/env bun
/**
 * Moon Blog 页面截图脚本
 *
 * 默认截取 README 用到的 9 张图，输出到 docs/screenshots/。
 * 也可以传 --url 截取任意页面。
 *
 * 使用前先启动站点：
 *   cd frontend
 *   bun run mock    # 终端 1
 *   bun run dev     # 终端 2
 *
 * 然后回到仓库根目录执行：
 *   bun scripts/screenshots.mjs
 */

import { createRequire } from "node:module";
import { access, mkdir, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontendRequire = createRequire(path.join(ROOT, "frontend", "package.json"));
const { chromium } = frontendRequire("playwright");

const DEFAULT_OPTS = {
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  outDir: path.join(ROOT, "docs", "screenshots"),
  width: 1440,
  height: 900,
  scale: 1,
  timeout: 30000,
  wait: 0,
  headed: false,
  dark: false,
  auth: false,
  fullPage: true,
  showPlayer: false,
  only: null,
  url: null,
  name: null,
  click: null,
  waitFor: null,
  email: process.env.SCREENSHOT_EMAIL || "test@qq.com",
  password: process.env.SCREENSHOT_PASSWORD || "12345678",
};

const PRESETS = [
  // 首页和文章页只截首屏，避免整页截图在 README 里过长
  { name: "home", path: "/", fullPage: false, height: 1000 },
  {
    name: "article",
    resolve: resolveArticlePath,
    fullPage: false,
    height: 1000,
    waitFor: "article",
  },
  { name: "archives", path: "/archives", fullPage: true },
  { name: "message", path: "/message", fullPage: true },
  { name: "links", path: "/links", fullPage: true },
  { name: "login", path: "/login", fullPage: true, waitFor: 'input[type="email"]' },
  {
    name: "admin-login",
    path: "/admin/login",
    fullPage: true,
    waitFor: 'input[type="email"]',
  },
  // 后台内容比一屏高，用更高的视口截完整仪表盘（页面本身是内部滚动，fullPage 无效）
  { name: "admin", path: "/admin", auth: true, fullPage: false, height: 1200, waitFor: "aside" },
  {
    name: "player",
    path: "/",
    fullPage: false,
    height: 1000,
    waitMs: 1600,
    action: openPlayer,
    showPlayer: true,
  },
];

const PRESET_NAMES = PRESETS.map((shot) => shot.name);

/* ------------------------------------------------------------------ */
/* CLI                                                                 */
/* ------------------------------------------------------------------ */

function printHelp() {
  console.log(`
Moon Blog 页面截图

用法：
  bun scripts/screenshots.mjs [选项]

预设截图（默认全部）：
  ${PRESET_NAMES.join("  ")}

示例：
  bun scripts/screenshots.mjs
  bun scripts/screenshots.mjs --only home,player
  bun scripts/screenshots.mjs --url /admin/music --auth --name admin-music
  bun scripts/screenshots.mjs --dark --scale 1.5
  bun scripts/screenshots.mjs --headed --only admin

选项：
  --base-url <url>   站点地址，默认 $BASE_URL 或 http://localhost:3000
  --out <dir>        输出目录，默认 docs/screenshots
  --only <a,b>       只截指定预设，逗号分隔
  --url <path>       截取任意页面（可与 --auth / --click 组合）
  --name <name>      配合 --url 指定输出文件名
  --auth             截图前登录后台（--url 模式）
  --click <selector> 截图前点击一个元素（--url 模式）
  --wait-for <sel>   等待选择器可见后再截图
  --wait <ms>        截图前额外等待，默认 0
  --width <px>       视口宽度，默认 1440
  --height <px>      视口高度，默认 900
  --scale <n>        设备像素比，默认 1
  --dark             使用深色主题
  --viewport         只截视口，不截整页（--url 模式）
  --show-player      保留左下角悬浮音乐播放器（默认隐藏）
  --headed           显示浏览器窗口，便于调试
  --timeout <ms>     单步超时，默认 30000
  --email <email>    后台登录邮箱，默认 $SCREENSHOT_EMAIL
  --password <pwd>   后台登录密码，默认 $SCREENSHOT_PASSWORD
  -h, --help         显示帮助

环境变量：
  BASE_URL                    站点地址
  SCREENSHOT_EMAIL            后台登录邮箱
  SCREENSHOT_PASSWORD         后台登录密码
  CHROMIUM_EXECUTABLE_PATH    手动指定 Chromium 可执行文件

说明：
  mock 后端默认账号为任意邮箱 + 12345678（默认 test@qq.com / 12345678）。
  连接真实后端时请通过 --email / --password 或环境变量传入管理员账号。
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
        opts.outDir = path.isAbsolute(value) ? value : path.resolve(ROOT, value);
        break;
      }
      case "--only":
        opts.only = read()
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean);
        break;
      case "--url":
        opts.url = read();
        break;
      case "--name":
        opts.name = read();
        break;
      case "--auth":
        opts.auth = true;
        break;
      case "--click":
        opts.click = read();
        break;
      case "--wait-for":
        opts.waitFor = read();
        break;
      case "--wait":
        opts.wait = Number(read());
        break;
      case "--width":
        opts.width = Number(read());
        break;
      case "--height":
        opts.height = Number(read());
        break;
      case "--scale":
        opts.scale = Number(read());
        break;
      case "--dark":
        opts.dark = true;
        break;
      case "--viewport":
        opts.fullPage = false;
        break;
      case "--show-player":
        opts.showPlayer = true;
        break;
      case "--headed":
        opts.headed = true;
        break;
      case "--timeout":
        opts.timeout = Number(read());
        break;
      case "--email":
        opts.email = read();
        break;
      case "--password":
        opts.password = read();
        break;
      default:
        throw new Error(`未知参数 ${arg}，使用 --help 查看用法`);
    }
  }

  for (const key of ["width", "height", "scale", "timeout", "wait"]) {
    if (!Number.isFinite(opts[key]) || opts[key] < 0) {
      throw new Error(`参数 --${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)} 必须是数字`);
    }
  }
  if (opts.scale <= 0) throw new Error("--scale 必须大于 0");

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
/* 页面操作                                                            */
/* ------------------------------------------------------------------ */

async function login(page, opts) {
  await page.goto(new URL("/admin/login", opts.baseUrl).toString(), {
    waitUntil: "domcontentloaded",
    timeout: opts.timeout,
  });

  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: "visible", timeout: opts.timeout });
  await page.waitForTimeout(300); // 等待 React hydration 完成
  await emailInput.fill(opts.email);
  await page.locator('input[type="password"]').fill(opts.password);

  // 页面里可能还有其它 form（例如浮动组件），只点登录表单里的提交按钮
  const loginForm = page
    .locator("form")
    .filter({ has: page.locator('input[type="email"]') })
    .first();
  await loginForm.getByRole("button", { name: "登录", exact: true }).click();

  try {
    await page.waitForURL(
      (url) => (typeof url === "string" ? new URL(url) : url).pathname === "/admin",
      { timeout: opts.timeout },
    );
  } catch {
    const text = await page
      .locator("body")
      .innerText()
      .catch(() => "");
    throw new Error(
      "后台登录失败，请检查 --email / --password 或 SCREENSHOT_EMAIL / SCREENSHOT_PASSWORD。" +
        `页面提示：${text.replace(/\s+/g, " ").slice(0, 120)}`,
    );
  }

  await page.waitForTimeout(400);
}

async function resolveArticlePath(page, opts) {
  try {
    const url = new URL("/api/v1/articles", opts.baseUrl);
    url.searchParams.set("current", "1");
    url.searchParams.set("size", "1");
    const response = await page.request.get(url.toString(), { timeout: 10000 });
    const json = await response.json();
    const id = json?.data?.records?.[0]?.id;
    if (id != null) return `/articles/${id}`;
  } catch {
    // 回退到 1
  }
  return "/articles/1";
}

async function openPlayer(page) {
  const trigger = page.getByRole("button", { name: "展开蜘蛛点唱机" });
  await trigger.waitFor({ state: "visible", timeout: 15000 });
  // 播放器面板会覆盖在按钮上方，普通 click 会被拦截；直接触发 DOM 点击
  await trigger.evaluate((element) => element.click());
  await page
    .locator('[aria-label="蜘蛛点唱机"]')
    .first()
    .waitFor({ state: "visible", timeout: 15000 });
}

/**
 * 等待字体、懒加载图片和入场动画稳定，必要时滚动整页触发加载。
 */
/**
 * 隐藏 Next.js 开发模式左下角的调试按钮；若页面本身报错则终止截图，
 * 避免把错误覆盖层当成页面截图保存。
 */
async function prepareForScreenshot(page, { showPlayer }) {
  const errorText = await page
    .evaluate(() => {
      for (const portal of document.querySelectorAll("nextjs-portal")) {
        const text = portal.shadowRoot?.textContent ?? "";
        if (/(Runtime Error|Build Error|Unhandled Runtime Error|Module not found)/i.test(text)) {
          return text.replace(/\s+/g, " ").slice(0, 220);
        }
      }
      return null;
    })
    .catch(() => null);

  if (errorText) throw new Error(`页面渲染出错：${errorText}`);

  if (!showPlayer) {
    await page.addStyleTag({
      content: ".music-player { display: none !important; }",
    });
  }

  await page
    .evaluate(() => {
      for (const portal of document.querySelectorAll("nextjs-portal")) {
        const root = portal.shadowRoot;
        if (!root || root.querySelector("style[data-screenshot-hide]")) continue;
        const style = document.createElement("style");
        style.setAttribute("data-screenshot-hide", "true");
        style.textContent = "#devtools-indicator { display: none !important; }";
        root.appendChild(style);
      }
    })
    .catch(() => {});
}

async function settle(page) {
  await page.waitForLoadState("load", { timeout: 10000 }).catch(() => {});
  await page
    .evaluate(async () => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      try {
        await document.fonts.ready;
      } catch {
        // 忽略
      }

      const step = Math.max(window.innerHeight - 120, 400);
      const max = Math.min(document.documentElement.scrollHeight, step * 20);
      for (let y = 0; y < max; y += step) {
        window.scrollTo(0, y);
        await sleep(60);
      }
      window.scrollTo(0, 0);

      const pending = [...document.images].filter((img) => !img.complete);
      await Promise.all(
        pending.map((img) =>
          new Promise((resolve) => {
            const done = () => resolve();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
            setTimeout(done, 2500);
          }),
        ),
      );
      await sleep(200);
    })
    .catch(() => {});
  await page.waitForTimeout(250);
}

/* ------------------------------------------------------------------ */
/* 截图                                                                */
/* ------------------------------------------------------------------ */

async function capture(browser, shot, opts) {
  const context = await browser.newContext({
    baseURL: opts.baseUrl,
    viewport: {
      width: shot.width ?? opts.width,
      height: shot.height ?? opts.height,
    },
    deviceScaleFactor: opts.scale,
    colorScheme: opts.dark ? "dark" : "light",
    locale: "zh-CN",
    timezoneId: "Asia/Shanghai",
  });

  await context.addInitScript(
    (theme) => {
      try {
        localStorage.setItem("theme", theme);
      } catch {
        // 忽略
      }
    },
    opts.dark ? "dark" : "light",
  );

  const page = await context.newPage();
  try {
    if (shot.auth) await login(page, opts);

    const target = shot.path
      ? shot.path
      : await shot.resolve(page, opts);

    if (/^[a-zA-Z]:[\\/]/.test(target)) {
      throw new Error(
        `--url 收到的是本地路径「${target}」，不是站内路径。` +
          "Git Bash / MSYS 会自动转换以 / 开头的参数，请改用完整 URL，或设置 MSYS_NO_PATHCONV=1。",
      );
    }

    const response = await page.goto(new URL(target, opts.baseUrl).toString(), {
      waitUntil: "domcontentloaded",
      timeout: opts.timeout,
    });
    if (response && response.status() >= 400) {
      throw new Error(`页面返回 HTTP ${response.status()}（${target}）`);
    }

    if (shot.waitFor) {
      await page
        .locator(shot.waitFor)
        .first()
        .waitFor({ state: "visible", timeout: opts.timeout });
    }

    await settle(page);

    if (shot.action) {
      await shot.action(page, opts);
      await page.waitForTimeout(300);
    }
    if (shot.waitMs) await page.waitForTimeout(shot.waitMs);
    if (opts.wait) await page.waitForTimeout(opts.wait);
    await prepareForScreenshot(page, {
      showPlayer: shot.showPlayer ?? opts.showPlayer,
    });

    await mkdir(opts.outDir, { recursive: true });
    const file = path.join(opts.outDir, `${safeFilename(shot.name)}.png`);
    await page.screenshot({
      path: file,
      fullPage: shot.fullPage ?? opts.fullPage,
      animations: "disabled",
      caret: "hide",
      timeout: opts.timeout,
    });
    return file;
  } finally {
    await context.close();
  }
}

function selectPresets(only) {
  if (!only) return PRESETS;

  const unknown = only.filter((name) => !PRESET_NAMES.includes(name));
  if (unknown.length > 0) {
    throw new Error(`未知截图名称：${unknown.join(", ")}。可用：${PRESET_NAMES.join(", ")}`);
  }
  return PRESETS.filter((shot) => only.includes(shot.name));
}

function adHocShot(opts) {
  return {
    name: opts.name || deriveName(opts.url),
    path: opts.url,
    auth: opts.auth,
    fullPage: opts.fullPage,
    showPlayer: opts.showPlayer,
    waitFor: opts.waitFor,
    action: opts.click
      ? async (page) => {
          await page.locator(opts.click).first().click();
        }
      : undefined,
  };
}

function deriveName(url) {
  try {
    const pathname = new URL(url, "http://localhost").pathname;
    const slug = pathname
      .replace(/^\/+|\/+$/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug || "home";
  } catch {
    return "page";
  }
}

function safeFilename(name) {
  return (
    name
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "") || "screenshot"
  );
}

async function ensureReachable(baseUrl) {
  try {
    const response = await fetch(baseUrl, {
      signal: AbortSignal.timeout(5000),
    });
    if (response.status >= 500) throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    throw new Error(
      `无法访问 ${baseUrl}。请先启动前端（cd frontend && bun run dev）` +
        `和 mock 后端（cd frontend && bun run mock）。\n  ${error.message}`,
    );
  }
}

/* ------------------------------------------------------------------ */
/* 入口                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const shots = opts.url ? [adHocShot(opts)] : selectPresets(opts.only);

  if (shots.length === 0) throw new Error("没有需要截取的页面");
  await ensureReachable(opts.baseUrl);
  await mkdir(opts.outDir, { recursive: true });

  const browser = await launchBrowser(opts);
  const results = [];

  try {
    for (const shot of shots) {
      process.stdout.write(`→ ${shot.name} ...`);
      try {
        const file = await capture(browser, shot, opts);
        results.push({ shot, ok: true });
        console.log(`\r✓ ${shot.name.padEnd(14)} ${path.relative(ROOT, file)}`);
      } catch (error) {
        results.push({ shot, ok: false });
        console.log(`\r✗ ${shot.name.padEnd(14)} ${error.message}`);
      }
    }
  } finally {
    await browser.close();
  }

  const failed = results.filter((result) => !result.ok).length;
  const succeeded = results.length - failed;
  console.log(
    `\n完成 ${succeeded}/${results.length} 张，输出目录：${path.relative(ROOT, opts.outDir) || "."}`,
  );
  if (failed > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`\n截图失败：${error.message}`);
  process.exit(1);
});
