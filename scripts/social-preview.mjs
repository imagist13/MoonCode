#!/usr/bin/env bun
/**
 * Moon Blog 社交预览图
 *
 * 用 Playwright 渲染 scripts/social-preview.html，输出 1280 × 640 的
 * docs/social-preview.png，供 GitHub 仓库 Settings → Social preview 使用。
 *
 * 用法：
 *   bun scripts/social-preview.mjs
 */

import { access, mkdir, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontendRequire = createRequire(path.join(ROOT, "frontend", "package.json"));
const { chromium } = frontendRequire("playwright");

const DEFAULT_OPTS = {
  html: path.join(ROOT, "scripts", "social-preview.html"),
  out: path.join(ROOT, "docs", "social-preview.png"),
  width: 1280,
  height: 640,
  scale: 1,
  headed: false,
};

function printHelp() {
  console.log(`
Moon Blog 社交预览图

用法：
  bun scripts/social-preview.mjs [选项]

选项：
  --html <file>     页面模板，默认 scripts/social-preview.html
  --out <file>      输出 PNG，默认 docs/social-preview.png
  --width <px>      宽度，默认 1280
  --height <px>     高度，默认 640
  --scale <n>       设备像素比，默认 1
  --headed          显示浏览器窗口，便于调试
  -h, --help        显示帮助

生成后到 GitHub 仓库 Settings → Social preview 手动上传。
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
      case "--html": {
        const value = read();
        opts.html = path.isAbsolute(value) ? value : path.resolve(ROOT, value);
        break;
      }
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
      case "--scale":
        opts.scale = Number(read());
        break;
      case "--headed":
        opts.headed = true;
        break;
      default:
        throw new Error(`未知参数 ${arg}，使用 --help 查看用法`);
    }
  }

  return opts;
}

async function launchBrowser(opts) {
  const candidates = [];
  if (process.env.CHROMIUM_EXECUTABLE_PATH) {
    candidates.push(process.env.CHROMIUM_EXECUTABLE_PATH);
  }
  const detected = await findChromiumExecutable();
  if (detected) candidates.push(detected);
  candidates.push(null);

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

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.html) throw new Error("--html 必须是绝对路径");
  if (!opts.out) throw new Error("--out 必须是绝对路径");

  const browser = await launchBrowser(opts);
  try {
    const page = await browser.newPage({
      viewport: { width: opts.width, height: opts.height },
      deviceScaleFactor: opts.scale,
    });
    await page.goto(pathToFileURL(opts.html).toString(), { waitUntil: "load" });
    await page.evaluate(async () => {
      try {
        await document.fonts.ready;
      } catch {}
      await Promise.all(
        [...document.images].map((img) =>
          img.complete ? null : new Promise((resolve) => (img.onload = img.onerror = resolve)),
        ),
      );
    });
    await page.waitForTimeout(300);

    await mkdir(path.dirname(opts.out), { recursive: true });
    await page.screenshot({ path: opts.out });
    console.log(`已生成 ${path.relative(ROOT, opts.out)}（${opts.width} × ${opts.height}）`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(`\n失败：${error.message}`);
  process.exit(1);
});
