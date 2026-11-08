import { test, expect } from "@playwright/test";

test.describe("暗黑模式", () => {
  test("点击切换按钮可在亮/暗模式间切换", async ({ page }) => {
    await page.goto("/");

    // 主题开关是 LeiBox 像素日夜开关（role="switch"，checked = 日间），
    // 用无障碍名称定位，避免绑定内部图标或阴影 DOM 结构
    const themeSwitch = page.getByRole("switch", { name: "日间模式" });

    await themeSwitch.click();

    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/, { timeout: 3000 });

    await themeSwitch.click();
    await expect(html).not.toHaveClass(/dark/, { timeout: 3000 });
  });

  test("暗黑模式持久化到 localStorage", async ({ page }) => {
    await page.goto("/");

    const themeSwitch = page.getByRole("switch", { name: "日间模式" });
    await themeSwitch.click();

    const theme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(theme).toBe("dark");

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/, { timeout: 5000 });
  });
});