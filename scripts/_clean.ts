import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.ts";
async function main() {
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
  const prisma = new PrismaClient({ adapter });
  const removed = await prisma.user.deleteMany({ where: { email: { contains: "test.com" } } });
  console.log("Usuários de teste removidos:", removed.count);
  await prisma.$disconnect();
}
main();
