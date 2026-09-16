import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const adminEmail = "admin@cardapio.digital";
const adminPassword =
  "$2b$10$I3OupkmBCPTtFQJUcq2qNO7E/V6dtjqL5aEbDy6JWFi71nKer5xX2"; // "admin123"

const sellerEmail = "demo@cardapio.digital";
const sellerPassword =
  "$2b$10$R7Qxkc4oG5gO.ZHGk9K/eOrrK9vklJBfFWj2fsOxnmu.EEYlUI6GG"; // "senha123"

async function ensureAdmin() {
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "ADMIN", status: "ACTIVE", password: adminPassword },
    });
    console.log("Admin pronto:", adminEmail);
    return;
  }
  await prisma.user.create({
    data: {
      name: "Administrador",
      email: adminEmail,
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("Admin criado:", adminEmail);
}

async function ensureDemoSeller() {
  const existing = await prisma.user.findUnique({ where: { email: sellerEmail } });

  let userId: string;
  if (existing) {
    await prisma.user.update({
      where: { email: sellerEmail },
      data: { role: "SELLER", status: "ACTIVE", password: sellerPassword },
    });
    userId = existing.id;
  } else {
    const user = await prisma.user.create({
      data: {
        name: "Hambúrgueria do João",
        email: sellerEmail,
        password: sellerPassword,
        role: "SELLER",
        status: "ACTIVE",
      },
    });
    userId = user.id;
  }

  let menu = await prisma.menu.findUnique({ where: { userId } });
  if (menu) {
    await prisma.menu.update({
      where: { id: menu.id },
      data: { slug: "hamburgueria-do-joao", name: "Hambúrgueria do João", isActive: true },
    });
  } else {
    menu = await prisma.menu.create({
      data: {
        userId,
        name: "Hambúrgueria do João",
        slug: "hamburgueria-do-joao",
        description: "Hambúrgueres artesanais e combos.",
        isActive: true,
      },
    });
  }

  const categoryCount = await prisma.category.count({ where: { menuId: menu.id } });
  if (categoryCount === 0) {
    const lanches = await prisma.category.create({
      data: { menuId: menu.id, name: "Lanches", position: 0 },
    });
    const bebidas = await prisma.category.create({
      data: { menuId: menu.id, name: "Bebidas", position: 1 },
    });
    await prisma.product.createMany({
      data: [
        {
          categoryId: lanches.id,
          name: "X-Burger Clássico",
          description: "Pão, burger 160g, queijo, alface e tomate.",
          price: 18.9,
          paymentLink: "https://pag.mercadopago.com.br/exemplo",
          position: 0,
        },
        {
          categoryId: lanches.id,
          name: "Combo com batata",
          description: "X-Burger Clássico + batata frita média.",
          price: 26.5,
          position: 1,
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

  console.log("Seller demo pronto:", sellerEmail, "/ menu:", menu.slug);
}

async function main() {
  await ensureAdmin();
  await ensureDemoSeller();
  console.log("\nLogins:");
  console.log("  Admin :", adminEmail, "/ admin123");
  console.log("  Seller:", sellerEmail, "/ senha123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
