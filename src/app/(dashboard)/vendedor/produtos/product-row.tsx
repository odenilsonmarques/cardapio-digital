"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  updateProductAction,
  deleteProductAction,
} from "@/lib/actions/products";
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
  available: boolean;
};

export function ProductRow({
  product,
  categoryId,
}: {
  product: Product;
  categoryId: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <EditForm
        product={product}
        categoryId={categoryId}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3">
      {product.image ? (
        <Image
          src={product.image}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
          unoptimized
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted"
        >
          <svg
            width="24"
            height="24"
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
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{product.name}</p>
          {!product.available && (
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-muted">
              Indisponível
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-accent">
          {formatCurrency(product.price)}
        </p>
        {product.paymentLink && (
          <p className="truncate text-xs text-muted">
            Pagamento: {product.paymentLink}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        <Button type="button" size="sm" variant="secondary" onClick={() => setEditing(true)}>
          Editar
        </Button>
        <form action={deleteProductAction}>
          <input type="hidden" name="id" value={product.id} />
          <Button type="submit" size="sm" variant="ghost">
            <span className="text-danger">Excluir</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

function EditForm({
  product,
  categoryId,
  onCancel,
}: {
  product: Product;
  categoryId: string;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateProductAction,
    {}
  );

  return (
    <form
      action={formAction}
      className="rounded-xl border border-border bg-surface p-5"
    >
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <div className="flex flex-col gap-4">
        <FormMessage error={state.error} success={state.success} />
        <Field label="Nome" htmlFor={`e-name-${product.id}`} required>
          <Input
            id={`e-name-${product.id}`}
            name="name"
            defaultValue={product.name}
            required
          />
        </Field>
        <Field label="Descrição" htmlFor={`e-desc-${product.id}`}>
          <Textarea
            id={`e-desc-${product.id}`}
            name="description"
            rows={2}
            defaultValue={product.description ?? ""}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Preço (R$)" htmlFor={`e-price-${product.id}`} required>
            <Input
              id={`e-price-${product.id}`}
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product.price}
              required
            />
          </Field>
          <Field label="Link de pagamento" htmlFor={`e-pay-${product.id}`}>
            <Input
              id={`e-pay-${product.id}`}
              name="paymentLink"
              type="url"
              defaultValue={product.paymentLink ?? ""}
            />
          </Field>
        </div>
        <Field label="Link da imagem" htmlFor={`e-img-${product.id}`}>
          <Input
            id={`e-img-${product.id}`}
            name="image"
            type="url"
            defaultValue={product.image ?? ""}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="available"
            defaultChecked={product.available}
            className="h-4 w-4 rounded border-border accent-[var(--accent)]"
          />
          Disponível para venda
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  );
}
