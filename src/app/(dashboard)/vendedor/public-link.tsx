"use client";

import { useState } from "react";
import Link from "next/link";

export function PublicLink({ url, slug }: { url: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all rounded-lg border border-border bg-surface-muted/60 px-3.5 py-2.5 text-sm text-accent"
      >
        {url}
      </Link>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-11 items-center justify-center rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-transform duration-150 ease-out hover:opacity-90 active:translate-y-px"
      >
        {copied ? "Copiado!" : "Copiar link"}
      </button>
      <p className="text-xs text-muted">
        Seu endereço público: cardapiodigital.com/menu/{slug}
      </p>
    </div>
  );
}
