import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateProductForm } from "./create-product-form";
import { ProductRow } from "./product-row";

export const metadata = {
  title: "Produtos",
};

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (currentUser?.role === "ADMIN") redirect("/admin/vendedores");

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { menu: { userId: session.user.id } },
      orderBy: { position: "asc" },
    }),
    prisma.product.findMany({
      where: { category: { menu: { userId: session.user.id } } },
      orderBy: [{ category: { position: "asc" } }, { position: "asc" }],
      include: { category: { select: { name: true, id: true } } },
    }),
  ]);

  const productsByCategory = categories.map((category) => ({
    category,
    products: products.filter((p) => p.categoryId === category.id),
  }));

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="font-serif text-3xl font-semibold">Produtos</h1>
        <p className="mt-2 text-muted">
          Cadastre os itens do seu cardápio com preço e link de pagamento.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-8">
          {categories.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-muted">
              Crie uma categoria primeiro em{" "}
              <a href="/vendedor/categorias" className="text-accent underline">
                Categorias
              </a>
              .
            </div>
          )}
          {productsByCategory.map(
            ({ category, products }) =>
              products.length > 0 && (
                <div key={category.id} className="flex flex-col gap-3">
                  <h2 className="font-serif text-xl font-semibold">
                    {category.name}
                  </h2>
                  {products.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={{
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        image: product.image,
                        paymentLink: product.paymentLink,
                        available: product.available,
                      }}
                      categoryId={category.id}
                    />
                  ))}
                </div>
              )
          )}
          {categories.length > 0 && products.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-muted">
              Nenhum produto ainda. Adicione o primeiro ao lado.
            </div>
          )}
        </div>
        <div className="h-fit rounded-xl border border-border bg-surface p-6">
          <h2 className="font-serif text-lg font-semibold">Novo produto</h2>
          <div className="mt-4">
            <CreateProductForm categories={categories} />
          </div>
        </div>
      </section>
    </div>
  );
}
