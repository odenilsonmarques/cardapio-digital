"use client";

import { useState, useTransition } from "react";
import { updateOrderStatusAction } from "@/lib/actions/orders";
import { formatCurrency } from "@/lib/format";

const statusOptions = [
  { value: "confirmed", label: "Confirmado" },
  { value: "ready_for_pickup", label: "Pronto para retirada" },
  { value: "out_for_delivery", label: "Saiu para entrega" },
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
    deliveryType: string;
    deliveryFee: number;
    total: number;
    createdAt: Date;
    items: { name: string; quantity: number; price: number }[];
  };
}) {
  const date = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(order.createdAt);

  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(order.status);
  const [prevOrderStatus, setPrevOrderStatus] = useState(order.status);
  if (order.status !== prevOrderStatus) {
    setPrevOrderStatus(order.status);
    setStatus(order.status);
  }

  function handleStatusChange(value: string) {
    setStatus(value);
    const formData = new FormData();
    formData.append("id", order.id);
    formData.append("status", value);
    startTransition(() => {
      updateOrderStatusAction(formData);
    });
  }

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
        <div className="flex items-center gap-2">
          <label htmlFor={`status-${order.id}`} className="sr-only">
            Status do pedido
          </label>
          <select
            id={`status-${order.id}`}
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isPending}
            aria-busy={isPending}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium disabled:opacity-60"
          >
            {status === "pending" && (
              <option value="pending" disabled>
                Pendente
              </option>
            )}
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul className="mt-4 flex flex-col divide-y divide-border border-b border-border pb-1">
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

      <div className="mt-3 flex flex-col gap-1">
        {order.deliveryFee > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Taxa de entrega</span>
            <span className="tabular-nums">
              {formatCurrency(order.deliveryFee)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Total</span>
          <span className="font-semibold tabular-nums">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1 rounded-lg bg-surface-muted/50 px-4 py-3 text-sm">
        <p>
          <span className="font-medium">Tipo:</span>{" "}
          {order.deliveryType === "pickup" ? "Retirada" : "Entrega"}
        </p>
        {order.customerPhone && (
          <p>
            <span className="font-medium">Telefone:</span>{" "}
            {order.customerPhone}
          </p>
        )}
        {order.deliveryType === "delivery" && order.customerAddress && (
          <p>
            <span className="font-medium">Endereço:</span>{" "}
            {order.customerAddress}
          </p>
        )}
        {order.notes && (
          <p>
            <span className="font-medium">Obs.:</span> {order.notes}
          </p>
        )}
      </div>
    </article>
  );
}
