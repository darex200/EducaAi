import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex max-w-6xl flex-col items-center px-4 py-10 sm:px-6">
        <AuthForm />
        <p className="mt-4 text-sm text-slate-600">
          También puedes ir directo al{" "}
          <Link href="/" className="font-medium text-indigo-700">
            tutor IA
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
