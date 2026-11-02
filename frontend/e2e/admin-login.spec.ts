import { test, expect } from "./fixtures";

test.describe.configure({ mode: "serial" });

test.describe("管理员登录", () => {
  test("登录页渲染，显示邮箱和密码输入框", async ({ page }) => {
    await page.goto("/admin/login");

    // FieldInput 的 id 由 useId 生成，用 label 定位更稳定
    await expect(page.getByLabel("邮箱")).toBeVisible();
    await expect(page.getByLabel("密码")).toBeVisible();
    await expect(page.getByRole("button", { name: "登录" })).toBeVisible();
  });

  test("未登录访问管理页重定向到登录", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 }).catch(() => {});
    expect(page.url()).toContain("/admin/login");
  });
});