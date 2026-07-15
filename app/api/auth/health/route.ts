import { NextResponse } from "next/server";
import { getAuthDiagnostics } from "@/lib/auth/config";

export async function GET() {
  const diagnostics = getAuthDiagnostics();

  return NextResponse.json({
    ...diagnostics,
    hint: !diagnostics.hasAuthSecret
      ? "Add AUTH_SECRET in Vercel and redeploy."
      : !diagnostics.googleConfigured
        ? "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel and redeploy."
        : "Auth configuration looks ready.",
  });
}
