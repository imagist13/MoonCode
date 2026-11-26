import { test, expect } from "@playwright/test";

/**
 * 蜘蛛点唱机回归用例：换歌后不能在两首曲目之间来回切换。
 *
 * 背景：展开层每秒都会把宿主当前的 track 回传给引擎；引擎换歌是一段
 * 1s+ 的搬运动画，动画结束前宿主上报的仍是旧曲目。若引擎把这种「回声」
 * 当成新请求排队，落到新曲目后会被旧曲目拽回去，形成 A→B→A→B 的死循环。
 *
 * 测试要点：
 * - 用静音 WAV 替换远端 mp3，保证 <audio> 真的在播放（timeupdate 才会
 *   驱动宿主每秒重渲染，这正是触发回声的条件）；
 * - 点「下一首」后先等曲目变化，再观察 8 秒内曲目名不允许再变。
 */

/** 生成一段静音 8-bit 单声道 WAV，避免依赖外网音频资源。 */
function silentWav(seconds = 30, sampleRate = 8000): Buffer {
  const data = Buffer.alloc(sampleRate * seconds, 128);
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate, 28);
  header.writeUInt16LE(1, 32);
  header.writeUInt16LE(8, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

test.describe("蜘蛛点唱机", () => {
  test("换歌后不会在两首曲目之间来回切换", async ({ page }) => {
    const wav = silentWav();
    await page.route(/SoundHelix-Song-\d+\.mp3/, (route) =>
      route.fulfill({ status: 200, contentType: "audio/wav", body: wav }),
    );

    await page.goto("/");

    // 音乐列表是客户端拉取的，播放器出现前先等接口返回
    const player = page.locator(".music-player");
    await expect(player).toBeVisible({ timeout: 30_000 });

    // 悬停展开悬浮播放器，点击封面开始播放（真实点击，满足自动播放策略）
    await player.hover();
    await page.waitForTimeout(500);
    await page.locator(".music-cover-wrapper").click();
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const audio = document.querySelector("audio");
            return Boolean(audio && !audio.paused && audio.currentTime > 0.2);
          }),
        { timeout: 15_000, message: "音频未开始播放，无法驱动 timeupdate 重渲染" },
      )
      .toBe(true);

    await page.getByRole("button", { name: "展开蜘蛛点唱机" }).click();
    const nextButton = page.locator(
      '[data-motion-component="spider-music-player"] [data-action="next"]',
    );
    await expect(nextButton).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(1_500); // 等场景布局稳定，避免抖动影响点击

    // 悬浮播放器在展开层打开时是 opacity-0，但文本仍可读取
    const trackName = page.locator(".music-player .music-track-name");
    const initial = (await trackName.textContent())?.trim();
    expect(initial).toBeTruthy();

    await nextButton.click();

    // 搬运动画结束后宿主的曲目应切到下一首
    await expect(trackName).not.toHaveText(initial!, { timeout: 15_000 });
    const switched = (await trackName.textContent())?.trim();
    expect(switched).toBeTruthy();
    expect(switched).not.toBe(initial);

    // 关键断言：再观察 8 秒（修复前每 ~2 秒回跳一次），曲目必须保持不变
    const observed = new Set<string>();
    const deadline = Date.now() + 8_000;
    while (Date.now() < deadline) {
      observed.add((await trackName.textContent())?.trim() ?? "");
      await page.waitForTimeout(200);
    }
    expect([...observed]).toEqual([switched]);
  });
});
