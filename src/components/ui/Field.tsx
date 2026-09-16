import { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

const inputBase =
  "w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-foreground placeholder:text-muted/70 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1 disabled:opacity-60";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputBase} ${className}`} {...props} />;
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={`${inputBase} ${className}`} {...props}></textarea>
  );
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {required && (
          <span className="text-accent" aria-hidden="true">
            {" "}
            *
          </span>
        )}
        {required && <span className="sr-only"> (obrigatório)</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p
          className="text-xs text-danger"
          id={`${htmlFor}-error`}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
