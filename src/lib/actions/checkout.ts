"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type CheckoutState = {
  error?: string;
  success?: string;
  paymentInstructions?: string;
  pixKey?: string;
};

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Informe seu nome"),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.coerce.number().int().min(1),
      })
    )
    .min(1, "Selecione pelo menos um item"),
});

export async function checkoutAction(
  slug: string,
  prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const menu = await prisma.menu.findUnique({ where: { slug } });
  if (!menu) return { error: "Cardápio não encontrado." };

  const rawItems: { productId: string; quantity: number }[] = [];
  const formEntries = Array.from(formData.entries());
  for (const [key, value] of formEntries) {
    if (key.startsWith("qty_")) {
      const productId = key.replace("qty_", "");
      const quantity = Number(value);
      if (quantity > 0) {
        rawItems.push({ productId, quantity });
      }
    }
  }

  const parsed = checkoutSchema.safeParse({
    customerName: formData.get("customerName"),
    customerPhone: formData.get("customerPhone") || undefined,
    customerAddress: formData.get("customerAddress") || undefined,
    notes: formData.get("notes") || undefined,
    items: rawItems,
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { items, ...customer } = parsed.data;

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, available: true, category: { menuId: menu.id } },
  });

  if (products.length !== items.length) {
    return { error: "Alguns produtos não estão mais disponíveis." };
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const orderItems = items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    };
  });

  const total = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  await prisma.order.create({
    data: {
      menuId: menu.id,
      ...customer,
      total,
      items: { create: orderItems },
    },
  });

  revalidatePath(`/menu/${slug}`);
  return {
    success: "Pedido enviado!",
    paymentInstructions: menu.paymentInstructions ?? undefined,
    pixKey: menu.pixKey ?? undefined,
  };
}
