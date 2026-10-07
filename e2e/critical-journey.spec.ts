import { expect, test } from "@playwright/test";

test.describe("critical tone journey", () => {
  test("search Apocalypse → open song → open Blackstar tone", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "tonekith" }).first()).toBeVisible();

    await page.goto("/search?q=Apocalypse");
    await expect(page.getByRole("heading", { name: "Search" })).toBeVisible();
    await expect(page.getByText(/Apocalypse/i).first()).toBeVisible();

    await page.goto("/songs/cigarettes-after-sex/apocalypse");
    await expect(page.getByRole("heading", { name: "Apocalypse" })).toBeVisible();
    const blackstar = page.getByRole("link", { name: /Blackstar bedroom Apocalypse/i }).first();
    await expect(blackstar).toBeVisible();

    await blackstar.click();
    await expect(page.getByRole("heading", { name: "Blackstar bedroom Apocalypse" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Signal chain" })).toBeVisible();
    await expect(page.getByText("Blackstar HT-20R MkII").first()).toBeVisible();
  });

  test("sign in and open create tone", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("maya@tonekith.local");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/");
    await page.goto("/tones/new");
    await expect(page.getByRole("heading", { name: "Create tone recipe" })).toBeVisible();
  });
});
