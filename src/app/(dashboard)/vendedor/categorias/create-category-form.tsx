"use client";

import { useActionState } from "react";
import {
  createCategoryAction,
  ActionState,
} from "@/lib/actions/categories";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";

const initialState: ActionState = {};

export function CreateCategoryForm() {
  const [state, formAction, pending] = useActionState(
    createCategoryAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage error={state.error} success={state.success} />
      <Field label="Nome" htmlFor="cat-name" required>
        <Input id="cat-name" name="name" placeholder="Ex.: Lanches" required />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Criando..." : "Adicionar categoria"}
      </Button>
    </form>
  );
}
