import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MenuView } from "./menu-view";

export const metadata = {
  title: "Cardápio",
};

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const menu = await prisma.menu.findUnique({
    where: { slug },
    include: {
      user: { select: { status: true } },
      categories: {
        orderBy: { position: "asc" },
        include: {
          products: {
            where: { available: true },
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  if (!menu) notFound();

  if (!menu.isActive || menu.user.status === "BLOCKED") {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <div
          aria-hidden="true"
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-muted"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M12 6v6l4 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-semibold">
          Cardápio temporariamente indisponível
        </h1>
        <p className="mt-3 max-w-sm text-muted">
          Este cardápio está pausado no momento. Volte mais tarde ou fale com o
          estabelecimento.
        </p>
      </main>
    );
  }

  return (
    <MenuView
      slug={slug}
      menuName={menu.name}
      menuDescription={menu.description}
      categories={menu.categories.map((category) => ({
        id: category.id,
        name: category.name,
        products: category.products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          paymentLink: product.paymentLink,
        })),
      }))}
    />
  );
}
