import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.ts";
async function main() {
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
  const prisma = new PrismaClient({ adapter });
  const menus = await prisma.menu.findMany({ select: { id: true, slug: true, userId: true, user: { select: { email: true } } } });
  console.log(JSON.stringify(menus, null, 2));
  await prisma.$disconnect();
}
main();
