"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

export type MenuState = { error?: string; success?: string };

const menuSchema = z.object({
  name: z.string().min(2, "Informe o nome do negócio"),
  description: z.string().optional(),
  slug: z
    .string()
    .min(2, "Slug muito curto")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
  paymentInstructions: z.string().optional(),
});

export async function updateMenuAction(
  _prevState: MenuState,
  formData: FormData
): Promise<MenuState> {
  const user = await requireUser();

  const parsed = menuSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    slug: formData.get("slug"),
    paymentInstructions: formData.get("paymentInstructions") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slugExists = await prisma.menu.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (slugExists && slugExists.userId !== user.id) {
    return { error: "Este endereço já está em uso por outro cardápio." };
  }

  await prisma.menu.upsert({
    where: { userId: user.id },
    update: { ...parsed.data },
    create: { userId: user.id, ...parsed.data },
  });

  revalidatePath("/vendedor");
  revalidatePath(`/menu/${parsed.data.slug}`);
  return { success: "Configurações salvas!" };
}
