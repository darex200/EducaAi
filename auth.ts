import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authConfig } from "@/auth.config";
import { ensureGoogleUser, isGoogleAuthConfigured } from "@/lib/auth/google-user";
import { cleanEnvValue } from "@/lib/auth/env";
import { getAuthSecret } from "@/lib/auth/config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "Correo", type: "email" },
      password: { label: "Contraseña", type: "password" },
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;

      try {
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email };
      } catch (error) {
        console.error("[auth] authorize error:", error);
        return null;
      }
    },
  }),
];

if (isGoogleAuthConfigured()) {
  providers.push(
    Google({
      clientId: cleanEnvValue(process.env.GOOGLE_CLIENT_ID),
      clientSecret: cleanEnvValue(process.env.GOOGLE_CLIENT_SECRET),
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: getAuthSecret(),
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        try {
          await ensureGoogleUser(user.email, user.name);
          return true;
        } catch (error) {
          console.error("[auth] google signIn error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { id: true, name: true, email: true },
        });
        if (dbUser) {
          token.sub = dbUser.id;
          token.name = dbUser.name;
          token.email = dbUser.email;
        }
      } else if (user?.id) {
        token.sub = user.id;
        if (user.name) token.name = user.name;
        if (user.email) token.email = user.email;
      }
      return token;
    },
  },
});

/** Devuelve el id del usuario autenticado o null. */
export async function getSessionUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}
