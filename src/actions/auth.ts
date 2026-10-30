"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { defaultUserEmoji, USER_EMOJIS } from "@/lib/emojis";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Usuario deve ter ao menos 3 caracteres")
    .max(20, "Usuario muito longo")
    .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, numeros e _"),
  password: z.string().min(1, "Informe uma senha"),
  phone: z.string().min(8, "Informe um telefone valido"),
  emoji: z.string().optional(),
});

export type ActionState = { error?: string; success?: string };

export async function registerAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    emoji: String(formData.get("emoji") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Dados invalidos" };
  }

  const username = parsed.data.username.toLowerCase();
  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return { error: "Esse usuario ja existe" };

  const chosenEmoji = USER_EMOJIS.includes(parsed.data.emoji ?? "")
    ? (parsed.data.emoji as string)
    : defaultUserEmoji(username);

  const hash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      password: hash,
      phone: parsed.data.phone,
      emoji: chosenEmoji,
      avatarSeed: username,
    },
  });
  await prisma.userStats.create({ data: { userId: user.id } });

  try {
    await signIn("credentials", {
      username,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (e) {
    if (e instanceof AuthError) return { error: "Conta criada, mas o login falhou" };
    throw e;
  }

  return { success: "ok" };
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await signIn("credentials", {
      username: String(formData.get("username") ?? "").toLowerCase(),
      password: String(formData.get("password") ?? ""),
      redirect: false,
    });
    return { success: "ok" };
  } catch (e) {
    if (e instanceof AuthError) return { error: "Usuario ou senha invalidos" };
    throw e;
  }
}
