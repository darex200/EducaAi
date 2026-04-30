import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col items-center px-4 py-10 sm:px-6">
        <AuthForm mode="register" />
        <p className="mt-4 text-sm text-slate-600">
          Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-indigo-700">
            Iniciar sesion
          </Link>
        </p>
      </main>
    </div>
  );
}
