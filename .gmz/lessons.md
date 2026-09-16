
## 2026-09-12 [prisma7, nextjs16, auth, gotcha]
Prisma 7 (installado em cardapio-digital) mudou APIs em relação à v6: (1) o datasource usa `prisma7.config.ts` (não `prisma.config.ts`) e o `DATABASE_URL` sai do schema para o config; (2) o generator `prisma-client` gera o client em `src/generated/prisma` (não `@prisma/client`), importe de `@/generated/prisma/client`; (3) o `new PrismaClient()` REQUER um driver adapter — para SQLite use `@prisma/adapter-better-sqlite3` com `new PrismaBetterSqlite3({ url: process.env.DATABASE_URL })`. Next.js 16 usa `proxy.ts` (não `middleware.ts`) e `params`/`searchParams` são Promises que precisam de `await`. Para layout de auth que não envolve login/register, use route groups `(auth)/admin/login` e `(dashboard)/admin/*` para evitar loop de redirect.

## 2026-09-12 [e2e, playwright, nextauth, nextjs, testing]
## Next Auth E2E: NEXTAUTH_URL precisa apontar para a porta do servidor de teste

Em testes Playwright com `next dev -p 3100`, o login com credenciais VÁLIDAS falhava com `ERR_CONNECTION_REFUSED` no `waitForURL("**/admin")`, mas o login inválido passava. Causa: o `.env` tem `NEXTAUTH_URL="http://localhost:3000"` — o `signIn` válido redireciona para a porta 3000 (morta). Login inválido fica na página e não redireciona, por isso passava. Correção: setar `NEXTAUTH_URL="http://localhost:<portaE2E>"` no comando do `webServer` do Playwright.

## Playwright: `filter({ hasText })` NÃO casa com value de input

No fluxo de renomear categoria, `filter({ hasText: "Teste Cat" })` deixava de achar a row quando o texto virava o `value` de um `<input>` (modo edição), porque `hasText` casa só com text content, não com value de input. Causava timeout no `.fill()`. Corrigir re-localizando pelo form/botão, não pelo texto.

## Playwright: next dev não roda 2x no mesmo projeto

`next dev -p 3100` recusa subir se já há um `next dev` na 3000 ("Another next dev server is already running") por causa do lock do `.next`. Para rodar webServer E2E do Playwright, pare o dev server principal antes, ou use banco/servidor dedicado.

## 2026-09-13 [prisma, migration, gotcha, e2e]
## Prisma 7: `prisma migrate dev` NÃO regenera o client

Neste projeto (Prisma 7, prisma-client generator), após `prisma migrate dev` o Prisma Client gerado em `src/generated/prisma` fica DESATUALIZADO — query com campo novo lança `PrismaClientValidationError: Unknown argument`. É preciso rodar `npx prisma generate` explicitamente depois de cada mudança de schema. O e2e.db também precisa de `prisma migrate deploy` antes do seed.
