import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client.ts";
async function main() {
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
  const prisma = new PrismaClient({ adapter });
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, status: true, menu: { select: { slug: true, isActive: true } } } });
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}
main();
