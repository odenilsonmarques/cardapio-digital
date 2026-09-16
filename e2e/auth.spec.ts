import { test, expect } from "@playwright/test";
import { ADMIN, SELLER, login } from "./helpers";

test.describe("Autenticação", () => {
  test("login admin e vê badge Admin + link Vendedores", async ({ page }) => {
    await login(page, ADMIN);
    await expect(page.getByText("Admin", { exact: true })).toBeVisible();
    await expect(
      page
        .getByRole("navigation", { name: "Navegação do painel" })
        .getByRole("link", { name: "Vendedores" })
    ).toBeVisible();
  });

  test("login seller e NÃO vê link Vendedores", async ({ page }) => {
    await login(page, SELLER);
    const nav = page.getByRole("navigation", { name: "Navegação do painel" });
    await expect(nav.getByRole("link", { name: "Vendedores" })).toHaveCount(0);
  });

  test("login com credenciais inválidas mostra erro", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("E-mail").fill("nao@existe.com");
    await page.getByLabel("Senha").fill("errada");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByText("E-mail ou senha inválidos.")).toBeVisible();
  });

  test("logout retorna à home", async ({ page }) => {
    await login(page, SELLER);
    await page.getByRole("button", { name: /Sair|Logout/i }).click();
    await page.waitForURL("**/");
    await expect(
      page.getByRole("heading", { name: /Seu cardápio digital/i })
    ).toBeVisible();
  });

  test("rota /admin exige login (redirect)", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/admin/login");
  });
});
