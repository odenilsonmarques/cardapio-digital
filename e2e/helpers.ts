import { Page, expect } from "@playwright/test";

export const ADMIN = { email: "e2e-admin@cardapio.digital", password: "admin123" };
export const SELLER = {
  email: "e2e-seller@cardapio.digital",
  password: "senha123",
};
export const MENU_SLUG = "e2e-hamburgueria";

export async function login(page: Page, creds: { email: string; password: string }) {
  await page.goto("/admin/login");
  await page.getByLabel("E-mail").fill(creds.email);
  await page.getByLabel("Senha").fill(creds.password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL("**/admin");
  await expect(
    page.getByRole("navigation", { name: "Navegação do painel" })
  ).toBeVisible();
}
