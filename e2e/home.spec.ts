import { test, expect } from "@playwright/test";

test.describe("Home pública", () => {
  test("renderiza landing com CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Seu cardápio digital/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Criar meu cardápio grátis" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Já tenho conta" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
  });
});
