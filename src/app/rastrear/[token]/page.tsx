import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { OrderTracker } from "./order-tracker";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Acompanhar pedido",
};

export default async function TrackOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const order = await prisma.order.findUnique({
    where: { trackingToken: token },
    include: {
      items: true,
      menu: { select: { name: true } },
    },
  });

  if (!order) notFound();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 py-10">
      <header className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          {order.menu.name}
        </p>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">
          Acompanhar pedido
        </h1>
      </header>
      <OrderTracker
        status={order.status}
        deliveryType={order.deliveryType === "pickup" ? "pickup" : "delivery"}
        customerName={order.customerName}
        createdAt={order.createdAt.toISOString()}
        items={order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        }))}
        total={order.total}
        deliveryFee={order.deliveryFee}
      />
    </main>
  );
}
