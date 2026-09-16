import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SellerRow } from "./seller-row";

export const metadata = {
  title: "Vendedores",
};

export default async function AdminSellersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!me || me.role !== "ADMIN") redirect("/vendedor");

  const sellers = await prisma.user.findMany({
    where: { role: "SELLER" },
    orderBy: { createdAt: "desc" },
    include: {
      menu: {
        include: {
          orders: { select: { total: true } },
          categories: { include: { _count: { select: { products: true } } } },
        },
      },
    },
  });

  const activeCount = sellers.filter(
    (s) => s.status === "ACTIVE" && s.menu?.isActive
  ).length;
  const blockedCount = sellers.length - activeCount;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Vendedores</h1>
          <p className="mt-2 text-muted">
            Gerencie seus clientes: bloqueie cardápios e registre pagamentos.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-border bg-surface px-5 py-3">
            <p className="text-sm text-muted">Ativos</p>
            <p className="font-serif text-2xl font-semibold text-success">
              {activeCount}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface px-5 py-3">
            <p className="text-sm text-muted">Bloqueados</p>
            <p className="font-serif text-2xl font-semibold text-danger">
              {blockedCount}
            </p>
          </div>
        </div>
      </section>

      {sellers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-muted">
          Nenhum vendedor cadastrado ainda.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <caption className="sr-only">
              Lista de vendedores cadastrados no sistema
            </caption>
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th scope="col" className="px-5 py-3 font-medium">
                  Vendedor
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Vencimento
                </th>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  Produtos
                </th>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  Pedidos
                </th>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  Faturamento
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => {
                const menu = seller.menu;
                const revenue = menu
                  ? menu.orders.reduce((sum, o) => sum + o.total, 0)
                  : 0;
                return (
                  <SellerRow
                    key={seller.id}
                    seller={{
                      id: seller.id,
                      name: seller.name ?? "—",
                      email: seller.email,
                      status: seller.status,
                      createdAt: seller.createdAt,
                    }}
                    menu={
                      menu
                        ? {
                            isActive: menu.isActive,
                            slug: menu.slug,
                            paymentDue: menu.paymentDue,
                            lastPaymentAt: menu.lastPaymentAt,
                            productCount: menu.categories.reduce(
                              (sum, c) => sum + c._count.products,
                              0
                            ),
                            orderCount: menu.orders.length,
                            revenue,
                          }
                        : null
                    }
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
