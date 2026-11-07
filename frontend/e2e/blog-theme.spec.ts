import { test, expect } from "@playwright/test";

test.describe("暗黑模式", () => {
  test("点击切换按钮可在亮/暗模式间切换", async ({ page }) => {
    await page.goto("/");

    // 前台已从 lucide 迁移到 Phosphor，按无障碍名称定位而不是图标类名
    const themeButton = page.getByRole("button", { name: "切换主题" });

    await themeButton.click();

    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/, { timeout: 3000 });

    await themeButton.click();
    await expect(html).not.toHaveClass(/dark/, { timeout: 3000 });
  });

  test("暗黑模式持久化到 localStorage", async ({ page }) => {
    await page.goto("/");

    const themeButton = page.getByRole("button", { name: "切换主题" });
    await themeButton.click();

    const theme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(theme).toBe("dark");

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/, { timeout: 5000 });
  });
});