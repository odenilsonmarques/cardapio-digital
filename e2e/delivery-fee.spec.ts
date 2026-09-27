import { test, expect } from "@playwright/test";
import Database from "better-sqlite3";

const MENU_SLUG = "e2e-hamburgueria";
const X_BURGER_PRICE = 18.9;
const DELIVERY_FEE = 5;

const db = new Database("e2e.db");

function setFee(value: number) {
  db.prepare(`UPDATE "Menu" SET "deliveryFee" = ? WHERE "slug" = ?`).run(
    value,
    MENU_SLUG
  );
}

function latestOrder(): {
  deliveryType: string;
  deliveryFee: number;
  total: number;
} {
  return db
    .prepare(
      `SELECT "deliveryType", "deliveryFee", "total" FROM "Order"
       WHERE "menuId" = (SELECT "id" FROM "Menu" WHERE "slug" = ?)
       ORDER BY "createdAt" DESC LIMIT 1`
    )
    .get(MENU_SLUG) as {
    deliveryType: string;
    deliveryFee: number;
    total: number;
  };
}

test.afterAll(() => {
  setFee(0);
  db.close();
});

test.describe("Taxa de entrega", () => {
  test("mostra subtotal + taxa quando entrega está selecionada", async ({
    page,
  }) => {
    setFee(DELIVERY_FEE);
    await page.goto(`/menu/${MENU_SLUG}`);
    await page.getByRole("button", { name: "Adicionar X-Burger E2E" }).click();
    await page.getByRole("button", { name: "Fazer pedido" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Taxa de entrega")).toBeVisible();
    await expect(
      dialog.getByText(
        (X_BURGER_PRICE + DELIVERY_FEE).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      )
    ).toBeVisible();
  });

  test("entrega: total inclui a taxa", async ({ page }) => {
    setFee(DELIVERY_FEE);
    await page.goto(`/menu/${MENU_SLUG}`);
    await page.getByRole("button", { name: "Adicionar X-Burger E2E" }).click();
    await page.getByRole("button", { name: "Fazer pedido" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Seu nome").fill("Cliente Taxa Entrega");
    await dialog.getByRole("button", { name: "Confirmar pedido" }).click();
    await expect(page.getByText("Pedido enviado!")).toBeVisible();

    const order = latestOrder();
    expect(order.deliveryType).toBe("delivery");
    expect(order.deliveryFee).toBeCloseTo(DELIVERY_FEE, 2);
    expect(order.total).toBeCloseTo(X_BURGER_PRICE + DELIVERY_FEE, 2);
  });

  test("retirada: total NÃO inclui a taxa", async ({ page }) => {
    setFee(DELIVERY_FEE);
    await page.goto(`/menu/${MENU_SLUG}`);
    await page.getByRole("button", { name: "Adicionar X-Burger E2E" }).click();
    await page.getByRole("button", { name: "Fazer pedido" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByText("Retirada", { exact: true }).click();
    await expect(dialog.getByText("Taxa de entrega")).toHaveCount(0);

    await dialog.getByLabel("Seu nome").fill("Cliente Retirada");
    await dialog.getByRole("button", { name: "Confirmar pedido" }).click();
    await expect(page.getByText("Pedido enviado!")).toBeVisible();

    const order = latestOrder();
    expect(order.deliveryType).toBe("pickup");
    expect(order.deliveryFee).toBe(0);
    expect(order.total).toBeCloseTo(X_BURGER_PRICE, 2);
  });
});
