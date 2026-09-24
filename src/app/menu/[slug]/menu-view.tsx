"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { checkoutAction, CheckoutState } from "@/lib/actions/checkout";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";
import { formatCurrency } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  paymentLink: string | null;
};

type Category = {
  id: string;
  name: string;
  products: Product[];
};

type MenuViewProps = {
  slug: string;
  menuName: string;
  menuDescription: string | null;
  categories: Category[];
};

type Cart = Record<string, number>;

export function MenuView({
  slug,
  menuName,
  menuDescription,
  categories,
}: MenuViewProps) {
  const [cart, setCart] = useState<Cart>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">(
    "delivery"
  );

  const boundCheckout = useMemo(
    () =>
      (prevState: CheckoutState, formData: FormData) =>
        checkoutAction(slug, false, prevState, formData),
    [slug]
  );
  const resetCheckout = useMemo(
    () =>
      (prevState: CheckoutState, formData: FormData) =>
        checkoutAction(slug, true, prevState, formData),
    [slug]
  );
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(
    boundCheckout,
    {}
  );
  const [, resetAction] = useActionState<CheckoutState, FormData>(
    resetCheckout,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  function closeCheckout() {
    setShowCheckout(false);
    if (state.success) {
      formRef.current?.reset();
      setCart({});
      setDeliveryType("delivery");
      resetAction(new FormData());
    }
  }

  const allProducts = categories.flatMap((c) => c.products);

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = allProducts.find((p) => p.id === id);
    return sum + (product ? product.price * qty : 0);
  }, 0);

  function updateQty(id: string, delta: number) {
    setCart((prev) => {
      const next = { ...prev, [id]: (prev[id] ?? 0) + delta };
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }

  async function copyPixKey() {
    if (!state.pixKey) return;
    try {
      await navigator.clipboard.writeText(state.pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function copyTrackingLink() {
    if (!state.trackingUrl) return;
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${state.trackingUrl}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(false);
    }
  }

  const orderedItems = Object.entries(cart)
    .map(([id, qty]) => ({ product: allProducts.find((p) => p.id === id)!, qty }))
    .filter((i) => i.product);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-5 pb-32 pt-10">
      <header className="mb-8 text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
          {menuName}
        </h1>
        {menuDescription && (
          <p className="mx-auto mt-2 max-w-md text-muted">{menuDescription}</p>
        )}
      </header>

      <div className="flex flex-col gap-10">
        {categories.map((category) => (
          <section key={category.id} aria-labelledby={`cat-${category.id}`}>
            <h2
              id={`cat-${category.id}`}
              className="mb-4 border-b border-border pb-2 font-serif text-xl font-semibold"
            >
              {category.name}
            </h2>
            <ul className="flex flex-col divide-y divide-border">
              {category.products.map((product) => {
                const qty = cart[product.id] ?? 0;
                return (
                  <li key={product.id} className="flex gap-4 py-4">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt=""
                        width={80}
                        height={80}
                        className="h-20 w-20 shrink-0 rounded-xl object-cover"
                        unoptimized
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-muted"
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 6v6l4 2" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          {product.description && (
                            <p className="mt-1 text-sm text-muted">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 font-semibold text-accent">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        {product.paymentLink && (
                          <a
                            href={product.paymentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-accent underline"
                          >
                            Pagar separado
                          </a>
                        )}
                        <div className="ml-auto flex items-center gap-2">
                          {qty > 0 && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateQty(product.id, -1)}
                                aria-label={`Remover ${product.name}`}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface font-medium transition-colors hover:bg-surface-muted"
                              >
                                −
                              </button>
                              <span className="w-6 text-center tabular-nums" aria-live="polite">
                                {qty}
                              </span>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => updateQty(product.id, 1)}
                            aria-label={`Adicionar ${product.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-medium text-accent-contrast transition-[transform,background-color] duration-150 ease-out hover:bg-accent-hover active:translate-y-px"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm text-muted">
              {totalItems} {totalItems === 1 ? "item" : "itens"}
            </p>
            <p className="font-semibold tabular-nums">
              {formatCurrency(totalPrice)}
            </p>
          </div>
          <Button
            size="lg"
            disabled={totalItems === 0}
            onClick={() => setShowCheckout(true)}
          >
            Fazer pedido
          </Button>
        </div>
      </div>

      {showCheckout && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-surface p-6 shadow-[0_1px_2px_hsl(24_40%_20%/0.08),0_24px_48px_hsl(24_40%_20%/0.16)] sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="checkout-title"
                className="font-serif text-xl font-semibold"
              >
                Finalizar pedido
              </h2>
              <button
                type="button"
                onClick={closeCheckout}
                aria-label="Fechar"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl text-muted transition-colors hover:bg-surface-muted"
              >
                ×
              </button>
            </div>

            <div className="mb-4 flex flex-col divide-y divide-border rounded-lg border border-border">
              {orderedItems.map(({ product, qty }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium">{qty}×</span>{" "}
                    {product.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted">
                    {formatCurrency(product.price * qty)}
                  </span>
                </div>
              ))}
            </div>

            <form ref={formRef} action={formAction} className="flex flex-col gap-4">
              <FormMessage error={state.error} success={state.success} />
              <Field label="Seu nome" htmlFor="customerName" required>
                <Input
                  id="customerName"
                  name="customerName"
                  autoComplete="name"
                  required
                />
              </Field>
              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-medium">
                  Como você quer receber?
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      deliveryType === "delivery"
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-surface text-muted hover:bg-surface-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryType"
                      value="delivery"
                      checked={deliveryType === "delivery"}
                      onChange={() => setDeliveryType("delivery")}
                      className="sr-only"
                    />
                    Entrega
                  </label>
                  <label
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      deliveryType === "pickup"
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-surface text-muted hover:bg-surface-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryType"
                      value="pickup"
                      checked={deliveryType === "pickup"}
                      onChange={() => setDeliveryType("pickup")}
                      className="sr-only"
                    />
                    Retirada
                  </label>
                </div>
              </fieldset>
              <Field
                label={
                  deliveryType === "pickup"
                    ? "Telefone (para avisarmos quando estiver pronto)"
                    : "Telefone"
                }
                htmlFor="customerPhone"
              >
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                />
              </Field>
              {deliveryType === "delivery" ? (
                <Field label="Endereço de entrega" htmlFor="customerAddress">
                  <Input
                    id="customerAddress"
                    name="customerAddress"
                    autoComplete="street-address"
                  />
                </Field>
              ) : (
                <p className="rounded-lg bg-surface-muted px-4 py-3 text-sm text-muted">
                  Retirada no estabelecimento. Você acompanhará quando o pedido
                  estiver pronto.
                </p>
              )}
              <Field label="Observações" htmlFor="notes">
                <Textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  placeholder="Ex.: sem cebola, ponto da carne..."
                />
              </Field>

              {orderedItems.map(({ product }) => (
                <input
                  key={product.id}
                  type="hidden"
                  name={`qty_${product.id}`}
                  value={cart[product.id]}
                />
              ))}

              <div className="flex items-center justify-between border-t border-border pt-4">
                <span className="font-medium">Total</span>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              {state.success ? (
                <div className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm">
              {state.trackingUrl && (
                <div className="mb-4 flex flex-col gap-2">
                  <p className="font-semibold text-foreground">
                    Acompanhe seu pedido
                  </p>
                  <p className="text-muted">
                    Guarde este link para acompanhar o status do seu pedido.
                  </p>
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3.5 py-2.5">
                    <a
                      href={state.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 flex-1 truncate break-all font-medium text-accent underline"
                    >
                      {state.trackingUrl}
                    </a>
                    <button
                      type="button"
                      onClick={copyTrackingLink}
                      className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
                    >
                      {copiedLink ? "Copiado!" : "Copiar link"}
                    </button>
                  </div>
                </div>
              )}
              {state.pixKey ? (
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="font-semibold">Pague com Pix</p>
                    <p className="mt-0.5 text-sm text-muted">
                      Use a chave abaixo para fazer a transferência.
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3.5 py-2.5">
                    <span className="min-w-0 break-all font-medium">
                      {state.pixKey}
                    </span>
                    <button
                      type="button"
                      onClick={copyPixKey}
                      className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
                    >
                      {copied ? "Copiado!" : "Copiar chave"}
                    </button>
                  </div>
                  {state.paymentInstructions && (
                    <p className="whitespace-pre-line text-sm text-muted">
                      {state.paymentInstructions}
                    </p>
                  )}
                </div>
              ) : state.paymentInstructions ? (
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Instruções de pagamento</p>
                  <p className="whitespace-pre-line text-muted">
                    {state.paymentInstructions}
                  </p>
                </div>
              ) : (
                    <p className="text-center text-muted">
                      Após confirmar, você receberá as instruções de pagamento.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <Button type="submit" size="lg" disabled={pending}>
                    {pending ? "Enviando..." : "Confirmar pedido"}
                  </Button>
                  <p className="text-center text-xs text-muted">
                    Após confirmar, você receberá as instruções de pagamento.
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
