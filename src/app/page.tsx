import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-serif text-xl font-semibold tracking-tight">
          cardápio<span className="text-accent">.digital</span>
        </span>
        <nav className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
          >
            Entrar
          </Link>
          <Button asChild size="sm">
            <Link href="/admin/register">Criar cardápio</Link>
          </Button>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        <section className="grid gap-12 py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-24">
          <div className="max-w-[62ch]">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Para quem vende comida de verdade
            </p>
            <h1 className="font-serif text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
              Seu cardápio digital, pronto para receber pedidos
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              Cadastre seus produtos com preço, foto e link de pagamento.
              Compartilhe um único link com seus clientes — eles escolhem,
              pedem e você recebe tudo em um só lugar.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/admin/register">Criar meu cardápio grátis</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/admin/login">Já tenho conta</Link>
              </Button>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="hidden rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_2px_hsl(24_40%_20%/0.08),0_12px_32px_hsl(24_40%_20%/0.10)] md:block"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="font-serif text-lg font-semibold">
                Hambúrgueria do João
              </span>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                Aberto
              </span>
            </div>
            <div className="space-y-3">
              {[
                { n: "X-Burger Clássico", p: "R$ 18,90" },
                { n: "Combo com batata", p: "R$ 26,50" },
                { n: "Refrigerante lata", p: "R$ 6,00" },
              ].map((item) => (
                <div
                  key={item.n}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/50 px-4 py-3"
                >
                  <span className="text-sm font-medium">{item.n}</span>
                  <span className="text-sm font-semibold text-accent">
                    {item.p}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg bg-foreground px-4 py-3 text-center text-sm font-medium text-background">
              Fazer pedido
            </div>
          </div>
        </section>

        <section className="border-t border-border py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h2 className="font-serif text-2xl font-semibold">
                Cadastre produtos
              </h2>
              <p className="mt-2 leading-relaxed text-muted">
                Nome, descrição, preço, foto e o link de pagamento (Pix,
                WhatsApp, Stripe). Tudo com poucos cliques.
              </p>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold">
                Receba pedidos
              </h2>
              <p className="mt-2 leading-relaxed text-muted">
                Seus clientes montam o pedido pelo link. Cada pedido chega
                organizado no seu painel, pronto para confirmar.
              </p>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold">
                Compartilhe um link
              </h2>
              <p className="mt-2 leading-relaxed text-muted">
                Sem app para baixar. O cliente abre no navegador do celular e
                faz o pedido direto.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto w-full max-w-6xl px-6 text-sm text-muted">
          © {new Date().getFullYear()} cardápio.digital
        </div>
      </footer>
    </div>
  );
}
