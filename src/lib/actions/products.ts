"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

export type ProductState = { error?: string; success?: string };

const productSchema = z.object({
  name: z.string().min(1, "Informe o nome do produto"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Informe um preço válido"),
  image: z.string().url("Link de imagem inválido").optional().or(z.literal("")),
  paymentLink: z.string().url("Link de pagamento inválido").optional().or(z.literal("")),
  available: z.coerce.boolean().optional(),
});

async function getOwnedMenuId(userId: string): Promise<string> {
  const menu = await prisma.menu.findUnique({ where: { userId } });
  if (!menu) throw new Error("Cardápio não encontrado");
  return menu.id;
}

async function getOwnedCategory(categoryId: string, menuId: string) {
  return prisma.category.findFirst({ where: { id: categoryId, menuId } });
}

export async function createProductAction(
  _prevState: ProductState,
  formData: FormData
): Promise<ProductState> {
  const user = await requireUser();
  const menuId = await getOwnedMenuId(user.id);
  const categoryId = formData.get("categoryId") as string;

  const category = await getOwnedCategory(categoryId, menuId);
  if (!category) return { error: "Categoria não encontrada" };

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    image: formData.get("image") || "",
    paymentLink: formData.get("paymentLink") || "",
    available: formData.get("available") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { available, ...data } = parsed.data;
  const count = await prisma.product.count({ where: { categoryId } });

  await prisma.product.create({
    data: {
      ...data,
      available: available ?? true,
      position: count,
      categoryId,
    },
  });

  revalidatePath("/vendedor");
  revalidatePath(`/menu/${menuId}`);
  return { success: "Produto criado!" };
}

export async function updateProductAction(
  _prevState: ProductState,
  formData: FormData
): Promise<ProductState> {
  const user = await requireUser();
  const menuId = await getOwnedMenuId(user.id);
  const id = formData.get("id") as string;
  const categoryId = formData.get("categoryId") as string;

  const category = await getOwnedCategory(categoryId, menuId);
  if (!category) return { error: "Categoria não encontrada" };

  const product = await prisma.product.findFirst({ where: { id, categoryId } });
  if (!product) return { error: "Produto não encontrado" };

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price: formData.get("price"),
    image: formData.get("image") || "",
    paymentLink: formData.get("paymentLink") || "",
    available: formData.get("available") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { available, ...data } = parsed.data;
  await prisma.product.update({
    where: { id },
    data: { ...data, available: available ?? true },
  });

  revalidatePath("/vendedor");
  return { success: "Produto atualizado!" };
}

export async function deleteProductAction(formData: FormData) {
  const user = await requireUser();
  const menuId = await getOwnedMenuId(user.id);
  const id = formData.get("id") as string;

  const product = await prisma.product.findFirst({
    where: { id, category: { menuId } },
  });
  if (!product) return;
  await prisma.product.delete({ where: { id } });
  revalidatePath("/vendedor");
}
