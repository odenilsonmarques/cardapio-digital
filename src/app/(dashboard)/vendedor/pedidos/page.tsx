import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OrderCard } from "./order-card";

export const metadata = {
  title: "Pedidos",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  done: "Concluído",
  cancelled: "Cancelado",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (currentUser?.role === "ADMIN") redirect("/admin/vendedores");

  const orders = await prisma.order.findMany({
    where: { menu: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="font-serif text-3xl font-semibold">Pedidos</h1>
        <p className="mt-2 text-muted">
          Acompanhe e confirme os pedidos recebidos pelo seu cardápio.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        {orders.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-muted">
            Nenhum pedido ainda. Compartilhe seu link para começar a receber
            pedidos.
          </div>
        )}
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={{
              id: order.id,
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              customerAddress: order.customerAddress,
              notes: order.notes,
              status: order.status,
              statusLabel: statusLabels[order.status] ?? order.status,
              total: order.total,
              createdAt: order.createdAt,
              items: order.items.map((i) => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price,
              })),
            }}
          />
        ))}
      </section>
    </div>
  );
}
