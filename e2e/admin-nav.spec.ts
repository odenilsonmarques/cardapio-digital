import { test, expect } from "@playwright/test";
import { ADMIN, SELLER, login } from "./helpers";

test("admin vê link Vendedores no AdminNav", async ({ page }) => {
  await login(page, ADMIN);
  await expect(
    page
      .getByRole("navigation", { name: "Navegação do painel" })
      .getByRole("link", { name: "Vendedores" })
  ).toBeVisible();
});

test("seller não vê link Vendedores no AdminNav", async ({ page }) => {
  await login(page, SELLER);
  const nav = page.getByRole("navigation", { name: "Navegação do painel" });
  await expect(nav.getByRole("link", { name: "Vendedores" })).toHaveCount(0);
});
