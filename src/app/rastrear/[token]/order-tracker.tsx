"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type OrderTrackerProps = {
  status: string;
  deliveryType: "pickup" | "delivery";
  customerName: string;
  createdAt: string;
  items: OrderItem[];
  total: number;
};

const TIMELINE: Record<"pickup" | "delivery", { key: string; label: string }[]> =
  {
    pickup: [
      { key: "pending", label: "Recebido" },
      { key: "confirmed", label: "Confirmado" },
      { key: "ready_for_pickup", label: "Pronto para retirada" },
      { key: "done", label: "Concluído" },
    ],
    delivery: [
      { key: "pending", label: "Recebido" },
      { key: "confirmed", label: "Confirmado" },
      { key: "out_for_delivery", label: "Saiu para entrega" },
      { key: "done", label: "Concluído" },
    ],
  };

const META: Record<string, { label: string; pill: string }> = {
  pending: { label: "Pendente", pill: "bg-surface-muted text-muted" },
  confirmed: { label: "Confirmado", pill: "bg-accent/10 text-accent" },
  ready_for_pickup: {
    label: "Pronto para retirada",
    pill: "bg-accent/10 text-accent",
  },
  out_for_delivery: {
    label: "Saiu para entrega",
    pill: "bg-accent/10 text-accent",
  },
  done: { label: "Concluído", pill: "bg-success/10 text-success" },
  cancelled: { label: "Cancelado", pill: "bg-danger/10 text-danger" },
};

const HINT: Record<string, string> = {
  pending: "Recebemos seu pedido. Aguardando confirmação.",
  confirmed: "O estabelecimento confirmou seu pedido.",
  ready_for_pickup: "Seu pedido está pronto para retirada.",
  out_for_delivery: "Seu pedido está a caminho.",
  done: "Seu pedido foi concluído.",
};

const TERMINAL = new Set(["done", "cancelled"]);
const POLL_MS = 5000;

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function OrderTracker({
  status,
  deliveryType,
  customerName,
  createdAt,
  items,
  total,
}: OrderTrackerProps) {
  const router = useRouter();
  const lastRefresh = useRef(0);

  useEffect(() => {
    lastRefresh.current = Date.now();
    const timer = setInterval(() => {
      const stale = Date.now() - lastRefresh.current > 2 * POLL_MS;
      if (document.visibilityState === "visible" && !stale) {
        lastRefresh.current = Date.now();
        router.refresh();
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [router]);

  const steps = TIMELINE[deliveryType] ?? TIMELINE.delivery;
  const cancelled = status === "cancelled";
  const done = status === "done";
  const meta =
    META[status] ??
    ({
      label: status,
      pill: "bg-surface-muted text-muted",
    } as { label: string; pill: string });
  const currentStep = cancelled ? 0 : steps.findIndex((s) => s.key === status);
  const reached = cancelled ? 0 : currentStep < 0 ? 0 : currentStep;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-5 py-4">
        <div className="min-w-0">
          <p className="text-sm">
            <span className="text-muted">Pedido de </span>
            <span className="font-medium">{customerName}</span>
          </p>
          <p className="text-xs text-muted">
            {deliveryType === "pickup" ? "Retirada" : "Entrega"} ·{" "}
            {formatDateTime(createdAt)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${meta.pill}`}
        >
          {meta.label}
        </span>
      </div>

      {cancelled ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-5 py-4 text-sm">
          <p className="font-semibold text-danger">Pedido cancelado</p>
          <p className="mt-1 text-muted">
            Este pedido foi cancelado pelo estabelecimento. Fale com o
            estabelecimento para mais informações.
          </p>
        </div>
      ) : (
        <ol className="flex flex-col">
          {steps.map((step, index) => {
            const isReached = index <= reached;
            const isCurrent = index === reached;
            const isConnector = index < steps.length - 1;
            return (
              <li key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      isReached
                        ? done && index === steps.length - 1
                          ? "bg-success text-white"
                          : "bg-accent text-accent-contrast"
                        : "bg-surface-muted text-muted"
                    } ${isCurrent && !done ? "ring-4 ring-accent/20" : ""}`}
                  >
                    {index + 1}
                  </span>
                  {isConnector && (
                    <span
                      className={`w-0.5 flex-1 ${
                        index < reached ? "bg-accent" : "bg-border"
                      }`}
                    />
                  )}
                </div>
                <div className={`pb-6 ${isConnector ? "" : "pb-0"}`}>
                  <p
                    className={`font-medium ${
                      isReached ? "text-foreground" : "text-muted"
                    }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && HINT[step.key] && (
                    <p className="text-sm text-muted">{HINT[step.key]}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <section className="rounded-xl border border-border bg-surface">
        <h2 className="border-b border-border px-5 py-3 font-serif text-lg font-semibold">
          Itens
        </h2>
        <ul className="flex flex-col divide-y divide-border px-5">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <span className="min-w-0">
                <span className="font-medium">{item.quantity}×</span>{" "}
                {item.name}
              </span>
              <span className="shrink-0 tabular-nums text-muted">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <span className="text-sm text-muted">Total</span>
          <span className="font-semibold tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      </section>

      <p
        className="text-center text-xs text-muted"
        aria-live="polite"
        suppressHydrationWarning
      >
        {TERMINAL.has(status)
          ? "Status final."
          : "Atualizando automaticamente…"}
      </p>
    </div>
  );
}
