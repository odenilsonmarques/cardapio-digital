"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type AdminState = { error?: string; success?: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user || user.role !== "ADMIN") redirect("/vendedor");
  return user;
}

const sellerIdSchema = z.string().min(1);

export async function toggleUserStatusAction(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  if (!sellerIdSchema.safeParse(id).success) return;
  if (status !== "ACTIVE" && status !== "BLOCKED") return;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role === "ADMIN") return;

  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { status } }),
    prisma.menu.updateMany({
      where: { userId: id },
      data: { isActive: status === "ACTIVE" },
    }),
  ]);

  revalidatePath("/admin/vendedores");
}

export async function toggleMenuAction(formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId") as string;
  const isActive = formData.get("isActive") === "true";

  if (!sellerIdSchema.safeParse(userId).success) return;

  const menu = await prisma.menu.findUnique({ where: { userId } });
  if (!menu) return;

  await prisma.menu.update({
    where: { id: menu.id },
    data: { isActive },
  });

  revalidatePath("/admin/vendedores");
  revalidatePath(`/menu/${menu.slug}`);
}

const paymentSchema = z.object({
  userId: z.string().min(1),
  paymentDue: z.string().optional(),
});

export async function setPaymentAction(
  _prevState: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin();
  const parsed = paymentSchema.safeParse({
    userId: formData.get("userId"),
    paymentDue: formData.get("paymentDue") || undefined,
  });
  if (!parsed.success) return { error: "Dados inválidos" };

  const { userId, paymentDue } = parsed.data;
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target || target.role === "ADMIN") return { error: "Vendedor inválido" };

  await prisma.menu.update({
    where: { userId },
    data: {
      lastPaymentAt: new Date(),
      paymentDue: paymentDue ? new Date(`${paymentDue}T23:59:59`) : null,
      isActive: true,
    },
  });

  revalidatePath("/admin/vendedores");
  return { success: "Pagamento registrado!" };
}
