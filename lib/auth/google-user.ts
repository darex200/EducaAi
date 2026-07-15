import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export function isGoogleAuthConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim(),
  );
}

export async function ensureGoogleUser(email: string, name?: string | null) {
  const normalizedEmail = email.toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    if (name?.trim() && name.trim() !== existing.name) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { name: name.trim() },
      });
    }
    return existing;
  }

  const passwordHash = await bcrypt.hash(`oauth-google-${crypto.randomUUID()}`, 10);

  return prisma.user.create({
    data: {
      email: normalizedEmail,
      name: name?.trim() || "Estudiante",
      passwordHash,
      profile: { create: {} },
    },
  });
}
