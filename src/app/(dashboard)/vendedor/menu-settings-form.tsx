"use client";

import { useActionState } from "react";
import {
  updateMenuAction,
  MenuState,
} from "@/lib/actions/menu";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";

const initialState: MenuState = {};

export function MenuSettingsForm({
  menu,
}: {
  menu: {
    name: string;
    description: string | null;
    slug: string;
    paymentInstructions: string | null;
    pixKey: string | null;
  } | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateMenuAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage error={state.error} success={state.success} />
      <Field label="Nome do negócio" htmlFor="name" required>
        <Input
          id="name"
          name="name"
          defaultValue={menu?.name ?? ""}
          required
        />
      </Field>
      <Field
        label="Descrição"
        htmlFor="description"
        hint="Uma frase curta sobre o seu negócio."
      >
        <Textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={menu?.description ?? ""}
        />
      </Field>
      <Field
        label="Endereço público"
        htmlFor="slug"
        required
        hint="Só letras minúsculas, números e hífens."
      >
        <Input
          id="slug"
          name="slug"
          defaultValue={menu?.slug ?? ""}
          pattern="[a-z0-9-]+"
          required
        />
      </Field>
      <Field
        label="Instruções de pagamento"
        htmlFor="paymentInstructions"
        hint="Texto exibido ao cliente após confirmar o pedido (Pix, chave, contato...)."
      >
        <Textarea
          id="paymentInstructions"
          name="paymentInstructions"
          rows={3}
          defaultValue={menu?.paymentInstructions ?? ""}
          placeholder="Ex.: Faça o Pix para a chave 11-99999-9999 e envie o comprovante no WhatsApp."
        />
      </Field>
      <Field
        label="Chave Pix"
        htmlFor="pixKey"
        hint="Chave que o cliente poderá copiar com um clique após o pedido."
      >
        <Input
          id="pixKey"
          name="pixKey"
          defaultValue={menu?.pixKey ?? ""}
          placeholder="Ex.: 11-99999-9999 ou sua@email.com"
        />
      </Field>
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar configurações"}
        </Button>
      </div>
    </form>
  );
}
