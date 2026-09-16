import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateCategoryForm } from "./create-category-form";
import { CategoryRow } from "./category-row";

export const metadata = {
  title: "Categorias",
};

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (currentUser?.role === "ADMIN") redirect("/admin/vendedores");

  const categories = await prisma.category.findMany({
    where: { menu: { userId: session.user.id } },
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="font-serif text-3xl font-semibold">Categorias</h1>
        <p className="mt-2 text-muted">
          Organize seus produtos em grupos, como &ldquo;Lanches&rdquo;, &ldquo;Bebidas&rdquo; e &ldquo;Sobremesas&rdquo;.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          {categories.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-muted">
              Nenhuma categoria ainda. Crie a primeira ao lado.
            </div>
          )}
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              id={category.id}
              name={category.name}
              productCount={category._count.products}
            />
          ))}
        </div>
        <div className="rounded-xl border border-border bg-surface p-6 h-fit">
          <h2 className="font-serif text-lg font-semibold">
            Nova categoria
          </h2>
          <div className="mt-4">
            <CreateCategoryForm />
          </div>
        </div>
      </section>
    </div>
  );
}
