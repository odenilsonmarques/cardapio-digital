import { execSync } from "node:child_process";

export default async function globalSetup() {
  const root = process.cwd();
  const dbUrl = "file:./e2e.db";

  execSync(`rm -f e2e.db e2e.db-journal`, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: dbUrl },
  });

  execSync(`npx prisma migrate deploy`, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: dbUrl },
  });

  execSync(`npx tsx scripts/e2e-seed.ts`, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: dbUrl },
  });
}
