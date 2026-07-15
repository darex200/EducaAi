import Link from "next/link";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { AuthForm } from "@/components/auth-form";
import { AuthOAuthNotice } from "@/components/auth-oauth-notice";

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col items-center px-4 py-10 sm:px-6">
        <Suspense fallback={null}>
          <AuthOAuthNotice />
        </Suspense>
        <AuthForm mode="login" />
        <p className="mt-4 text-sm text-slate-600">
          ¿Primera vez?{" "}
          <Link href="/register" className="font-medium text-indigo-700">
            Crear cuenta
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
