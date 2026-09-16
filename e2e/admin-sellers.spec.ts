import { test, expect } from "@playwright/test";
import { ADMIN, SELLER, login } from "./helpers";

test.describe("Painel de vendedores (admin)", () => {
  test("lista vendedores com métricas", async ({ page }) => {
    await login(page, ADMIN);
    await page.goto("/admin/admin");
    await expect(
      page.getByRole("heading", { name: "Vendedores" })
    ).toBeVisible();
    await expect(page.getByText("E2E Hambúrgueria")).toBeVisible();
    await expect(page.getByText(SELLER.email)).toBeVisible();
    await expect(page.getByText("Ativos")).toBeVisible();
    await expect(page.getByText("Bloqueados")).toBeVisible();
  });

  test("bloqueia e desbloqueia um vendedor", async ({ page }) => {
    await login(page, ADMIN);
    await page.goto("/admin/admin");

    const row = page.getByText("E2E Hambúrgueria").locator("..").locator("..").locator("..");
    await row.getByRole("button", { name: "Bloquear" }).click();
    await expect(row.getByText("Bloqueado")).toBeVisible();

    await row.getByRole("button", { name: "Desbloquear" }).click();
    await expect(row.getByText("Ativo")).toBeVisible();
  });

  test("seller não acessa /admin/admin (redirect)", async ({ page }) => {
    await login(page, SELLER);
    await page.goto("/admin/admin");
    await page.waitForURL("**/admin");
    await expect(
      page.getByRole("heading", { name: "Visão geral" })
    ).toBeVisible();
  });
});
