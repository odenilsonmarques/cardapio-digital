import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { menu: true },
  });
  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function getMenuForUser(userId: string) {
  const menu = await prisma.menu.findUnique({
    where: { userId },
    include: {
      categories: {
        orderBy: { position: "asc" },
        include: {
          products: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });
  return menu;
}
