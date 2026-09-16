import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="font-serif text-xl font-semibold tracking-tight"
          >
            cardápio<span className="text-accent">.digital</span>
          </Link>
          <h1 className="mt-6 font-serif text-3xl font-semibold">
            Entrar na sua conta
          </h1>
          <p className="mt-2 text-muted">
            Acesse o painel do seu cardápio.
          </p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted">
          Ainda não tem conta?{" "}
          <Link
            href="/admin/register"
            className="font-medium text-accent hover:underline"
          >
            Criar cardápio grátis
          </Link>
        </p>
      </div>
    </main>
  );
}
