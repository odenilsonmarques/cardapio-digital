import { test, expect } from "@playwright/test";
import { SELLER, login } from "./helpers";

test.describe("Dashboard do seller", () => {
  test("visão geral mostra contadores e configurações", async ({ page }) => {
    await login(page, SELLER);
    const main = page.getByRole("main");
    await expect(
      page.getByRole("heading", { name: "Visão geral" })
    ).toBeVisible();
    await expect(main.getByText("Produtos", { exact: true })).toBeVisible();
    await expect(main.getByText("Categorias", { exact: true })).toBeVisible();
    await expect(main.getByText("Pedidos", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Configurações do cardápio" })
    ).toBeVisible();
  });

  test("cria e renomeia uma categoria", async ({ page }) => {
    await login(page, SELLER);
    await page.goto("/vendedor/categorias");

    await page.getByLabel("Nome").fill("Teste Cat");
    await page.getByRole("button", { name: "Adicionar categoria" }).click();
    await expect(page.getByText("Teste Cat")).toBeVisible();

    const row = page
      .locator("div.rounded-xl.border")
      .filter({ hasText: "Teste Cat" });
    await row.getByRole("button", { name: "Renomear" }).click();
    const editForm = page
      .locator("form")
      .filter({ has: page.getByRole("button", { name: "Salvar" }) });
    await editForm.getByRole("textbox").fill("Teste Cat Renomeada");
    await editForm.getByRole("button", { name: "Salvar" }).click();
    await expect(editForm.getByRole("textbox")).toHaveValue(
      "Teste Cat Renomeada"
    );
  });

  test("cria um produto e o vê listado", async ({ page }) => {
    await login(page, SELLER);
    await page.goto("/vendedor/produtos");

    await page.getByLabel("Nome").fill("Produto E2E");
    await page.getByLabel("Preço (R$)").fill("12.5");
    await page.getByRole("button", { name: "Adicionar produto" }).click();
    await expect(page.getByText("Produto E2E")).toBeVisible();
    await expect(page.getByText("R$ 12,50")).toBeVisible();
  });

  test("salva configurações do cardápio", async ({ page }) => {
    await login(page, SELLER);
    await page.goto("/vendedor");

    const nameInput = page.getByLabel("Nome do negócio");
    await nameInput.fill("E2E Hambúrgueria");
    await page.getByRole("button", { name: "Salvar configurações" }).click();
    await expect(page.getByText("Configurações salvas!")).toBeVisible();
  });
});
