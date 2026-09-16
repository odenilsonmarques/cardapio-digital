import { test, expect } from "@playwright/test";
import { MENU_SLUG } from "./helpers";

test.describe("Cardápio público", () => {
  test("exibe categorias e produtos", async ({ page }) => {
    await page.goto(`/menu/${MENU_SLUG}`);
    await expect(
      page.getByRole("heading", { name: "E2E Hambúrgueria" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Lanches" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Bebidas" })).toBeVisible();
    await expect(page.getByText("X-Burger E2E")).toBeVisible();
  });

  test("faz um pedido completo", async ({ page }) => {
    await page.goto(`/menu/${MENU_SLUG}`);
    await page.getByRole("button", { name: "Adicionar X-Burger E2E" }).click();
    await page.getByRole("button", { name: "Fazer pedido" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Seu nome").fill("Cliente E2E");
    await dialog.getByLabel("Telefone").fill("(11) 99999-9999");
    await dialog.getByLabel("Endereço de entrega").fill("Rua Teste, 123");
    await dialog.getByRole("button", { name: "Confirmar pedido" }).click();

    await expect(page.getByText("Pedido enviado!")).toBeVisible();
    await expect(
      page.getByRole("dialog").getByText("Instruções de pagamento")
    ).toBeVisible();
    await expect(
      page
        .getByRole("dialog")
        .getByText(/Faça o Pix para a chave e2e@teste\.com/)
    ).toBeVisible();
  });

  test("cardápio inexistente retorna 404", async ({ page }) => {
    const res = await page.goto(`/menu/nao-existe-xyz`);
    await expect(res?.status()).toBe(404);
  });
});
