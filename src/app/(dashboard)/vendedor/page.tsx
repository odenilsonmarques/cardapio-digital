import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MenuSettingsForm } from "./menu-settings-form";
import { PublicLink } from "./public-link";

export const metadata = {
  title: "Visão geral",
};

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (currentUser?.role === "ADMIN") redirect("/admin/vendedores");

  const [menu, productCount, categoryCount, orderCount] = await Promise.all([
    prisma.menu.findUnique({ where: { userId: session.user.id } }),
    prisma.product.count({
      where: { category: { menu: { userId: session.user.id } } },
    }),
    prisma.category.count({
      where: { menu: { userId: session.user.id } },
    }),
    prisma.order.count({
      where: { menu: { userId: session.user.id } },
    }),
  ]);

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="font-serif text-3xl font-semibold">Visão geral</h1>
        <p className="mt-2 text-muted">
          Gerencie as configurações e o link público do seu cardápio.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Produtos", value: productCount },
          { label: "Categorias", value: categoryCount },
          { label: "Pedidos", value: orderCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-surface px-5 py-4"
          >
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-1 font-serif text-3xl font-semibold">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-serif text-xl font-semibold">
            Configurações do cardápio
          </h2>
          <p className="mt-1 text-sm text-muted">
            Dê um nome ao seu negócio e escolha o endereço público.
          </p>
          <div className="mt-5">
            <MenuSettingsForm menu={menu} />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="font-serif text-xl font-semibold">
            Link para compartilhar
          </h2>
          <p className="mt-1 text-sm text-muted">
            Envie este link para seus clientes. Eles abrem no celular e fazem o
            pedido.
          </p>
          <div className="mt-5">
            {menu ? (
              <PublicLink
                url={`${baseUrl}/menu/${menu.slug}`}
                slug={menu.slug}
              />
            ) : (
              <p className="text-sm text-muted">
                Salve as configurações para gerar o link.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
