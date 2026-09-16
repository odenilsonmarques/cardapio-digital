"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/vendedor", label: "Visão geral" },
  { href: "/vendedor/categorias", label: "Categorias" },
  { href: "/vendedor/produtos", label: "Produtos" },
  { href: "/vendedor/pedidos", label: "Pedidos" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação do painel" className="mx-auto w-full max-w-6xl px-6">
      <div className="flex gap-1 overflow-x-auto">
        {links.map((link) => {
          const active =
            link.href === "/vendedor"
              ? pathname === "/vendedor"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
