import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().trim().min(2, "El nombre es demasiado corto."),
  email: z.string().trim().email("Correo electrónico inválido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  birthYear: z.number().int().min(1930).max(new Date().getFullYear()).optional(),
  academicLevel: z
    .enum(["primaria", "secundaria", "bachillerato", "universidad"])
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message ?? "Datos de registro inválidos.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { name, email, password, birthYear, academicLevel } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este correo." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        birthYear,
        academicLevel,
        profile: { create: {} },
      },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("[register] error:", error);
    return NextResponse.json(
      { error: "No se pudo crear la cuenta. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
