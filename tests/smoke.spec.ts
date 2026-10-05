import { test, expect } from "@playwright/test";
test("German homepage and keyboard entry point", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.locator("h1")).toHaveCount(1);
  await page.keyboard.press("Tab");
  await expect(page.getByText("Zum Inhalt", { exact: true })).toBeFocused();
});
test("mobile navigation is usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  const menu = page.getByRole("button", { name: "Menü öffnen" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.locator("#navigation a").first().focus();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});
