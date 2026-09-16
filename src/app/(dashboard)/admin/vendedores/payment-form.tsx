"use client";

import { useActionState } from "react";
import { setPaymentAction, AdminState } from "@/lib/actions/admin";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { FormMessage } from "@/components/ui/FormMessage";

const initialState: AdminState = {};

export function PaymentForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(
    setPaymentAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="flex w-56 flex-col gap-3 rounded-lg border border-border bg-surface-muted/50 p-3"
    >
      <input type="hidden" name="userId" value={userId} />
      <FormMessage error={state.error} success={state.success} />
      <Field label="Próximo vencimento" htmlFor={`due-${userId}`}>
        <Input id={`due-${userId}`} name="paymentDue" type="date" />
      </Field>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Registrando..." : "Registrar pagamento"}
      </Button>
    </form>
  );
}
