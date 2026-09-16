import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "./logout-button";
import { Nav } from "./nav";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { menu: true },
  });

  const slug = user?.menu?.slug;

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/vendedor"
            className="font-serif text-lg font-semibold tracking-tight"
          >
            cardápio<span className="text-accent">.digital</span>
          </Link>
          <div className="flex items-center gap-3">
            {slug && (
              <Link
                href={`/menu/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted sm:inline-flex"
              >
                Ver cardápio
              </Link>
            )}
            <span className="hidden text-sm text-muted md:inline">
              {user?.name}
            </span>
            <LogoutButton />
          </div>
        </div>
        <Nav />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
