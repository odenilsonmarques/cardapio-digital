"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

export type ActionState = { error?: string; success?: string };

const categorySchema = z.object({
  name: z.string().min(1, "Informe o nome da categoria"),
});

async function getOwnedMenuId(userId: string): Promise<string> {
  const menu = await prisma.menu.findUnique({ where: { userId } });
  if (!menu) throw new Error("Cardápio não encontrado");
  return menu.id;
}

export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const menuId = await getOwnedMenuId(user.id);
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const count = await prisma.category.count({ where: { menuId } });
  await prisma.category.create({
    data: { menuId, name: parsed.data.name, position: count },
  });

  revalidatePath("/vendedor");
  return { success: "Categoria criada!" };
}

export async function renameCategoryAction(formData: FormData) {
  const user = await requireUser();
  const menuId = await getOwnedMenuId(user.id);
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;

  const owned = await prisma.category.findFirst({ where: { id, menuId } });
  if (!owned) return;

  await prisma.category.update({
    where: { id },
    data: { name },
  });
  revalidatePath("/vendedor");
}

export async function deleteCategoryAction(formData: FormData) {
  const user = await requireUser();
  const menuId = await getOwnedMenuId(user.id);
  const id = formData.get("id") as string;
  const owned = await prisma.category.findFirst({ where: { id, menuId } });
  if (!owned) return;
  await prisma.category.delete({ where: { id } });
  revalidatePath("/vendedor");
}
