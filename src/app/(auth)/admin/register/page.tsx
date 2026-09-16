import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata = {
  title: "Criar conta",
};

export default function RegisterPage() {
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
            Crie seu cardápio
          </h1>
          <p className="mt-2 text-muted">
            Leva menos de um minuto. Comece grátis.
          </p>
        </div>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link
            href="/admin/login"
            className="font-medium text-accent hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
