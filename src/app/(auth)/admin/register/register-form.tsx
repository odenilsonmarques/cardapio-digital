"use client";

import { useActionState } from "react";
import { registerAction, AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";

const initialState: AuthState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FormMessage error={state.error} success={state.success} />
      <Field label="Nome do negócio" htmlFor="name" required>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Ex.: Hambúrgueria do João"
          required
        />
      </Field>
      <Field label="E-mail" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </Field>
      <Field label="Senha" htmlFor="password" required>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </Field>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Criando..." : "Criar meu cardápio"}
      </Button>
    </form>
  );
}
