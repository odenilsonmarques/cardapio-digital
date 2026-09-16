"use client";

import { useActionState } from "react";
import {
  createProductAction,
  ProductState,
} from "@/lib/actions/products";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";

const initialState: ProductState = {};

export function CreateProductForm({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    createProductAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage error={state.error} success={state.success} />
      <Field label="Categoria" htmlFor="categoryId" required>
        <select
          id="categoryId"
          name="categoryId"
          required
          className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-foreground"
          defaultValue={categories[0]?.id ?? ""}
        >
          {categories.length === 0 && (
            <option value="">Crie uma categoria primeiro</option>
          )}
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Nome" htmlFor="p-name" required>
        <Input
          id="p-name"
          name="name"
          placeholder="Ex.: X-Burger Clássico"
          required
        />
      </Field>
      <Field label="Descrição" htmlFor="p-desc">
        <Textarea
          id="p-desc"
          name="description"
          rows={2}
          placeholder="Ingredientes, opções..."
        />
      </Field>
      <Field label="Preço (R$)" htmlFor="p-price" required>
        <Input
          id="p-price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          placeholder="18,90"
          required
        />
      </Field>
      <Field
        label="Link da imagem"
        htmlFor="p-image"
        hint="URL de uma foto (opcional)."
      >
        <Input
          id="p-image"
          name="image"
          type="url"
          placeholder="https://..."
        />
      </Field>
      <Field
        label="Link de pagamento"
        htmlFor="p-paylink"
        hint="Link do produto (Pix, WhatsApp, Stripe)."
      >
        <Input
          id="p-paylink"
          name="paymentLink"
          type="url"
          placeholder="https://..."
        />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="available"
          defaultChecked
          className="h-4 w-4 rounded border-border accent-[var(--accent)]"
        />
        Disponível para venda
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Adicionando..." : "Adicionar produto"}
      </Button>
    </form>
  );
}
