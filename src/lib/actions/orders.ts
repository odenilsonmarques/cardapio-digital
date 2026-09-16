"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";

export async function updateOrderStatusAction(formData: FormData) {
  const user = await requireUser();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  const valid = ["pending", "confirmed", "done", "cancelled"];
  if (!valid.includes(status)) return;

  const order = await prisma.order.findFirst({
    where: { id, menu: { userId: user.id } },
  });
  if (!order) return;

  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/vendedor");
  revalidatePath("/vendedor/pedidos");
}
