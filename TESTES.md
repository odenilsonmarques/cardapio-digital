# Guia de Testes — Cardápio Digital

Guia completo para testar manualmente a aplicação no navegador, cobrindo todas as rotas,
funcionalidades e fluxos. Use o dev server em `http://localhost:3000` (banco `dev.db`).

---

## 1. Dados de acesso

| Perfil | E-mail | Senha | Acesso |
|--------|--------|-------|--------|
| **Admin** | `admin@cardapio.digital` | `admin123` | Dashboard + painel de Vendedores |
| **Seller (vendedor)** | `demo@cardapio.digital` | `senha123` | Dashboard do próprio cardápio |

Menu público do seller: `http://localhost:3000/menu/hamburgueria-do-joao`

---

## 2. Tabela de rotas

| Rota | Acesso | Função | Autenticação |
|------|--------|--------|--------------|
| `/` | Público | Landing page (marketing + CTAs) | Não |
| `/admin/login` | Público | Login de admin e seller | Não |
| `/admin/register` | Público | Criar conta de seller | Não |
| `/admin` | Admin/Seller | Dashboard: visão geral, config do cardápio, link público | Sim |
| `/admin/categorias` | Admin/Seller | CRUD de categorias | Sim |
| `/admin/produtos` | Admin/Seller | CRUD de produtos | Sim |
| `/admin/pedidos` | Admin/Seller | Lista e muda status dos pedidos | Sim |
| `/admin/admin` | **Somente Admin** | Gerenciar vendedores (bloquear, pagamento) | Sim (role ADMIN) |
| `/menu/[slug]` | Público | Cardápio público + checkout | Não |

**Regra de acesso:** seller que tentar abrir `/admin/admin` é redirecionado para `/admin`.
Qualquer rota `/admin*` sem sessão redireciona para `/admin/login`.

---

## 3. Funcionalidades, como funcionam e passos de teste

### 3.1 Autenticação

**Como funciona:** login via `next-auth` (credentials + JWT). O token carrega `id` e `role`
(ADMIN/SELLER). O nav do dashboard muda conforme a role. Logout limpa a sessão e volta pra home.

**Testar:**
1. Abrir `/admin/login`.
2. Login inválido: e-mail `x@x.com` / senha `errada` → deve mostrar "E-mail ou senha inválidos.".
3. Login seller: `demo@cardapio.digital` / `senha123` → entra no dashboard. No header, NÃO deve aparecer o link "Vendedores".
4. Login admin: `admin@cardapio.digital` / `admin123` → entra no dashboard. Deve ver badge "Admin" + link "Vendedores" no nav.
5. Logout: clicar em "Sair" → volta para a home.
6. Acessar `/admin` sem login → redireciona para `/admin/login`.

### 3.2 Registro de conta (criar cardápio)

**Como funciona:** o formulário cria um usuário (role SELLER por padrão), gera um menu com slug
a partir do nome + id, e já loga automaticamente levando ao dashboard.

**Testar:**
1. Abrir `/admin/register`.
2. Preencher nome/email/senha (mínimo 6 caracteres) e clicar "Criar meu cardápio".
3. Deve logar automaticamente e cair em `/admin` (dashboard do novo seller).
4. Usar email já cadastrado → deve mostrar "Este e-mail já está cadastrado.".

### 3.3 Landing page `/`

**Como funciona:** página de marketing com CTAs "Criar meu cardápio grátis" e "Já tenho conta".

**Testar:**
1. Abrir `/`.
2. Ver título, os 3 blocos de benefícios e os botões.
3. Clicar em "Criar meu cardápio grátis" → vai para `/admin/register`.
4. Clicar em "Já tenho conta" → vai para `/admin/login`.

### 3.4 Dashboard — Visão geral `/admin`

**Como funciona:** mostra 3 contadores (Produtos, Categorias, Pedidos), o formulário de
configurações do cardápio (nome, descrição, slug) e o link público para compartilhar.

**Testar (logado como seller):**
1. Abrir `/admin`.
2. Ver os 3 contadores (devem bater com os dados do seller).
3. No card "Configurações do cardápio": alterar a descrição e clicar "Salvar configurações".
   Deve mostrar "Configurações salvas!".
4. No mesmo card, preencher o campo **"Instruções de pagamento"** (ex.: chave Pix + contato)
   e salvar. É esse texto que o cliente vê após finalizar o pedido.
5. Ver o "Link para compartilhar" com o slug `hamburgueria-do-joao`. Clicar em "Ver cardápio"
   (header) abre o menu público em nova aba.
6. Alterar o slug e salvar → o link público muda para o novo slug.

### 3.5 Cardápio público `/menu/[slug]`

**Como funciona:** renderiza o menu do seller com categorias e produtos **disponíveis**
(`available: true`). O cliente adiciona itens ao carrinho e finaliza o pedido num modal.

**Testar:**
1. Abrir `/menu/hamburgueria-do-joao`.
2. Ver o nome do estabelecimento, descrição, categorias (Lanches, Bebidas) e produtos.
3. Adicionar 1 item: clicar no botão "+" do produto. O contador de itens e o total no rodapé
   fixo atualizam.
4. Adicionar/remover quantidades com os botões "−"/"+".
5. Clicar "Fazer pedido" → abre modal de checkout.
6. Preencher nome (obrigatório), telefone, endereço, observações.
7. Clicar "Confirmar pedido" → mostra "Pedido enviado!" e, se o seller cadastrou instruções
   de pagamento, exibe o bloco **"Instruções de pagamento"** na tela (o botão "Confirmar"
   some para evitar pedido duplicado). Se não houver instruções, mostra o texto informativo.
8. Rota inexistente (`/menu/nao-existe`) → página 404.

### 3.6 Categorias `/admin/categorias`

**Como funciona:** lista categorias do seller (com nº de produtos). Permite criar, renomear e
excluir. Excluir categoria remove os produtos dela (cascade).

**Testar (logado como seller):**
1. Abrir `/admin/categorias`.
2. Criar: preencher "Nome" (ex.: "Sobremesas") → "Adicionar categoria" → aparece na lista.
3. Renomear: clicar "Renomear" na categoria, trocar o nome, "Salvar".
4. Excluir: clicar "Excluir" na categoria → some da lista.

### 3.7 Produtos `/admin/produtos`

**Como funciona:** lista produtos agrupados por categoria. Permite criar, editar e excluir.
Cada produto tem nome, descrição, preço, link de imagem, link de pagamento e flag
"disponível para venda".

**Testar (logado como seller):**
1. Abrir `/admin/produtos`.
2. Criar: escolher categoria, preencher nome, descrição, preço, clicar "Adicionar produto".
   Deve aparecer listado sob a categoria, com o preço formatado (ex.: R$ 12,50).
3. Editar: clicar "Editar", alterar preço/nome, "Salvar".
4. Desmarcar "Disponível para venda" e salvar → aparece selo "Indisponível" e some do cardápio público.
5. Excluir: clicar "Excluir".

### 3.8 Pedidos `/admin/pedidos`

**Como funciona:** lista pedidos recebidos (do cardápio público), com itens, total, dados do
cliente e um dropdown para mudar o status (Pendente → Confirmado → Concluído / Cancelado).

**Testar (logado como seller):**
1. Fazer um pedido pelo cardápio público (passo 3.5) para gerar dado.
2. Abrir `/admin/pedidos` → ver o pedido com cliente, itens, total e telefone/endereço.
3. Mudar o status no dropdown para "Confirmado" → o pedido atualiza.
4. Testar status "Concluído" e "Cancelado".

### 3.9 Gerenciamento de vendedores `/admin/admin` (somente Admin)

**Como funciona:** tabela com todos os sellers, mostrando status (Ativo/Bloqueado), vencimento,
nº de produtos, pedidos e faturamento. Permite: bloquear/desbloquear o vendedor (desativa o
menu), ativar/desativar o cardápio e registrar pagamento (define vencimento).

**Testar (logado como admin):**
1. Abrir `/admin/admin`.
2. Ver a tabela com o seller `demo@cardapio.digital` e as métricas (produtos, pedidos, faturamento).
3. Clicar "Bloquear" → status vira "Bloqueado". Verificar que `/menu/hamburgueria-do-joao`
   agora mostra "Cardápio temporariamente indisponível".
4. Clicar "Desbloquear" → volta a "Ativo" e o menu público volta a funcionar.
5. Clicar "Desativar cardápio" → menu off. "Ativar cardápio" → volta.
6. Clicar "Registrar pagamento", definir a data de vencimento e "Registrar pagamento" →
   mostra "Pagamento registrado!" e atualiza a coluna Vencimento.
7. Logar como seller e tentar abrir `/admin/admin` → é redirecionado para `/admin`.

---

## 4. Observações / bugs conhecidos (encontrados nos testes E2E)

- **Renomear categoria não fecha o form**: após salvar, o campo de edição permanece aberto
  (o estado `editing` só fecha com "Cancelar"). O valor renomeado é salvo, mas a UI não colapsa.
- **`revalidatePath("/admin")`** em renomear/excluir categoria e produto não revalida a rota
  atual (`/admin/categorias` / `/admin/produtos`); a lista pode ficar desatualizada até um reload.

---

## 5. Rodar os testes E2E automatizados

Os testes E2E usam um **banco separado** (`e2e.db`, recriado a cada execução) e um servidor
dedicado na porta 3100 — não afetam o `dev.db`.

```bash
# IMPORTANTE: pare o dev server (porta 3000) antes, pois o Next não roda 2 instâncias
npx playwright test        # roda toda a suíte (18 testes)
npx playwright test e2e/auth.spec.ts   # só um arquivo
npm run test:e2e           # atalho equivalente a "playwright test"
```
