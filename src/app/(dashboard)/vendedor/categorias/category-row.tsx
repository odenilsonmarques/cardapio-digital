"use client";

import { useState } from "react";
import {
  renameCategoryAction,
  deleteCategoryAction,
} from "@/lib/actions/categories";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function CategoryRow({
  id,
  name,
  productCount,
}: {
  id: string;
  name: string;
  productCount: number;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-5 py-4">
      {editing ? (
        <form
          action={renameCategoryAction}
          className="flex flex-1 items-center gap-2"
        >
          <input type="hidden" name="id" value={id} />
          <Input name="name" defaultValue={name} required className="max-w-xs" />
          <Button type="submit" size="sm">
            Salvar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditing(false)}
          >
            Cancelar
          </Button>
        </form>
      ) : (
        <div className="flex flex-1 items-center justify-between gap-4">
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted">
              {productCount} {productCount === 1 ? "produto" : "produtos"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
            >
              Renomear
            </Button>
            <form action={deleteCategoryAction}>
              <input type="hidden" name="id" value={id} />
              <Button type="submit" size="sm" variant="ghost">
                <span className="text-danger">Excluir</span>
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
