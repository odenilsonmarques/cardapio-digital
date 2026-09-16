"use client";

import { useEffect, useState } from "react";
import { updateOrderStatusAction } from "@/lib/actions/orders";
import { formatCurrency } from "@/lib/format";

const statusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "done", label: "Concluído" },
  { value: "cancelled", label: "Cancelado" },
];

export function OrderCard({
  order,
}: {
  order: {
    id: string;
    customerName: string;
    customerPhone: string | null;
    customerAddress: string | null;
    notes: string | null;
    status: string;
    statusLabel: string;
    total: number;
    createdAt: Date;
    items: { name: string; quantity: number; price: number }[];
  };
}) {
  const date = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(order.createdAt);

  const [status, setStatus] = useState(order.status);

  useEffect(() => {
    setStatus(order.status);
  }, [order.status]);

  return (
    <article className="rounded-xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-semibold">
            {order.customerName}
          </h2>
          <p className="text-sm text-muted">
            {date} · Pedido #{order.id.slice(0, 8)}
          </p>
        </div>
        <form action={updateOrderStatusAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={order.id} />
          <label htmlFor={`status-${order.id}`} className="sr-only">
            Status do pedido
          </label>
          <select
            id={`status-${order.id}`}
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            onBlur={(e) => e.currentTarget.form?.requestSubmit()}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </form>
      </div>

      <ul className="mt-4 flex flex-col divide-y divide-border">
        {order.items.map((item, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-3 py-2 text-sm"
          >
            <span>
              <span className="font-medium">{item.quantity}×</span> {item.name}
            </span>
            <span className="tabular-nums text-muted">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm text-muted">Total</span>
        <span className="font-semibold tabular-nums">
          {formatCurrency(order.total)}
        </span>
      </div>

      {(order.customerPhone || order.customerAddress || order.notes) && (
        <div className="mt-4 flex flex-col gap-1 rounded-lg bg-surface-muted/50 px-4 py-3 text-sm">
          {order.customerPhone && (
            <p>
              <span className="font-medium">Telefone:</span>{" "}
              {order.customerPhone}
            </p>
          )}
          {order.customerAddress && (
            <p>
              <span className="font-medium">Entrega:</span>{" "}
              {order.customerAddress}
            </p>
          )}
          {order.notes && (
            <p>
              <span className="font-medium">Obs.:</span> {order.notes}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
