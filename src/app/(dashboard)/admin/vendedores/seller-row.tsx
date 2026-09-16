"use client";

import { useState } from "react";
import {
  toggleUserStatusAction,
  toggleMenuAction,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/format";
import { PaymentForm } from "./payment-form";

type Seller = {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
};

type Menu = {
  isActive: boolean;
  slug: string;
  paymentDue: Date | null;
  lastPaymentAt: Date | null;
  productCount: number;
  orderCount: number;
  revenue: number;
};

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

export function SellerRow({ seller, menu }: { seller: Seller; menu: Menu | null }) {
  const [showPayment, setShowPayment] = useState(false);
  const blocked = seller.status === "BLOCKED";
  const menuOff = !menu || !menu.isActive;
  const overdue =
    menu?.paymentDue && menu.paymentDue < new Date() && !menuOff;

  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-surface-muted/30">
      <td className="px-5 py-4">
        <p className="font-medium">{seller.name}</p>
        <p className="text-xs text-muted">{seller.email}</p>
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            blocked
              ? "bg-danger/10 text-danger"
              : "bg-success/10 text-success"
          }`}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-current"
          />
          {blocked ? "Bloqueado" : "Ativo"}
        </span>
        {menuOff && !blocked && (
          <span className="ml-2 inline-flex items-center rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-muted">
            Cardápio off
          </span>
        )}
        {overdue && (
          <span className="ml-2 inline-flex items-center rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
            Pagamento atrasado
          </span>
        )}
      </td>
      <td className="px-5 py-4 tabular-nums text-muted">
        {formatDate(menu?.paymentDue ?? null)}
      </td>
      <td className="px-5 py-4 text-right tabular-nums">
        {menu?.productCount ?? 0}
      </td>
      <td className="px-5 py-4 text-right tabular-nums">
        {menu?.orderCount ?? 0}
      </td>
      <td className="px-5 py-4 text-right font-medium tabular-nums">
        {formatCurrency(menu?.revenue ?? 0)}
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-col items-end gap-2">
          <form action={toggleUserStatusAction}>
            <input type="hidden" name="id" value={seller.id} />
            <input
              type="hidden"
              name="status"
              value={blocked ? "ACTIVE" : "BLOCKED"}
            />
            <Button
              type="submit"
              size="sm"
              variant={blocked ? "secondary" : "danger"}
            >
              {blocked ? "Desbloquear" : "Bloquear"}
            </Button>
          </form>
          {menu && (
            <form action={toggleMenuAction}>
              <input type="hidden" name="userId" value={seller.id} />
              <input
                type="hidden"
                name="isActive"
                value={menuOff ? "true" : "false"}
              />
              <Button type="submit" size="sm" variant="secondary">
                {menuOff ? "Ativar cardápio" : "Desativar cardápio"}
              </Button>
            </form>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowPayment((v) => !v)}
          >
            {showPayment ? "Fechar pagamento" : "Registrar pagamento"}
          </Button>
          {showPayment && <PaymentForm userId={seller.id} />}
        </div>
      </td>
    </tr>
  );
}
