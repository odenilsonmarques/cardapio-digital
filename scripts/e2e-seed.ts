import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./e2e.db",
});
const prisma = new PrismaClient({ adapter });

const adminEmail = "e2e-admin@cardapio.digital";
const adminPassword =
  "$2b$10$I3OupkmBCPTtFQJUcq2qNO7E/V6dtjqL5aEbDy6JWFi71nKer5xX2"; // "admin123"

const sellerEmail = "e2e-seller@cardapio.digital";
const sellerPassword =
  "$2b$10$R7Qxkc4oG5gO.ZHGk9K/eOrrK9vklJBfFWj2fsOxnmu.EEYlUI6GG"; // "senha123"

async function upsertUser(email: string, data: object) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return prisma.user.update({ where: { email }, data });
  }
  return prisma.user.create({ data: { email, ...data } as never });
}

async function main() {
  await upsertUser(adminEmail, {
    name: "E2E Admin",
    password: adminPassword,
    role: "ADMIN",
    status: "ACTIVE",
  });

  const seller = await upsertUser(sellerEmail, {
    name: "E2E Hambúrgueria",
    password: sellerPassword,
    role: "SELLER",
    status: "ACTIVE",
  });

  let menu = await prisma.menu.findUnique({ where: { userId: seller.id } });
  if (menu) {
    await prisma.menu.update({
      where: { id: menu.id },
      data: {
        slug: "e2e-hamburgueria",
        name: "E2E Hambúrgueria",
        description: "Cardápio de teste E2E.",
        paymentInstructions:
          "Faça o Pix para a chave e2e@teste.com e envie o comprovante.",
        isActive: true,
      },
    });
  } else {
    menu = await prisma.menu.create({
      data: {
        userId: seller.id,
        name: "E2E Hambúrgueria",
        slug: "e2e-hamburgueria",
        description: "Cardápio de teste E2E.",
        paymentInstructions:
          "Faça o Pix para a chave e2e@teste.com e envie o comprovante.",
        isActive: true,
      },
    });
  }

  const categories =
    (await prisma.category.findMany({ where: { menuId: menu.id } })) ?? [];
  let lanches = categories.find((c) => c.name === "Lanches");
  if (!lanches) {
    lanches = await prisma.category.create({
      data: { menuId: menu.id, name: "Lanches", position: 0 },
    });
  }
  let bebidas = categories.find((c) => c.name === "Bebidas");
  if (!bebidas) {
    bebidas = await prisma.category.create({
      data: { menuId: menu.id, name: "Bebidas", position: 1 },
    });
  }

  const existingProducts = await prisma.product.findMany({
    where: { categoryId: lanches.id },
  });
  if (existingProducts.length === 0) {
    await prisma.product.createMany({
      data: [
        {
          categoryId: lanches.id,
          name: "X-Burger E2E",
          description: "Burger de teste.",
          price: 18.9,
          paymentLink: "https://pag.mercadopago.com.br/exemplo",
          position: 0,
        },
        {
          categoryId: bebidas.id,
          name: "Refrigerante lata",
          price: 6.0,
          position: 0,
        },
      ],
    });
  }

  await prisma.order.deleteMany({ where: { menuId: menu.id } });

  console.log("E2E seed pronto:", adminEmail, "/ admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
