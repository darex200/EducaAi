import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col items-center px-4 py-10 sm:px-6">
        <AuthForm mode="login" />
        <p className="mt-4 text-sm text-slate-600">
          Aun no tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-indigo-700">
            Crear cuenta
          </Link>
        </p>
      </main>
    </div>
  );
}
