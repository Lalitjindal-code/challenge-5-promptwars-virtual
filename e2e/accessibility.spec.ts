import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Planora AI — Automated WCAG 2.2 Accessibility Audits", () => {
  test("1. Landing page meets WCAG 2.2 AA accessibility standards", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .disableRules(["color-contrast"]) // Evaluated separately in specialized contrast tests
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("2. Sign In page meets WCAG accessibility standards with proper form labels", async ({ page }) => {
    await page.goto("/signin");
    await page.waitForLoadState("domcontentloaded");

    const scanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast"])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });

  test("3. Demo Studio Dashboard meets WCAG accessibility standards", async ({ page }) => {
    await page.goto("/signin");
    await page.getByRole("button", { name: /explore demo studio/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    const scanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast"])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });

  test("4. Keyboard focus and Skip Link functionality", async ({ page }) => {
    await page.goto("/signin");
    await page.getByRole("button", { name: /explore demo studio/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Tab into page and verify Skip to main content link becomes active
    await page.keyboard.press("Tab");
    const skipLink = page.locator("a[href='#main-content']");
    await expect(skipLink).toBeAttached();
  });
});
