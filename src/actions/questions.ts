"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireUser, assertGroupAdmin } from '@/lib/guards';
import { questionSchema } from '@/lib/validation';

async function canEdit(groupId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.role === 'SUPER_ADMIN') return true;
  await assertGroupAdmin(groupId, userId);
  return true;
}

export type QState = { error?: string; success?: string };

export async function saveQuestionAction(groupId: string, questionId: string | null, payload: unknown): Promise<QState> {
  try {
    const user = await requireUser();
    await canEdit(groupId, user.id);
    const parsed = questionSchema.safeParse(payload);
    if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Dados invalidos' };
    const data = parsed.data;

    const normalizeMedia = (m: { mediaUrl?: string; mediaType?: string; mediaSource?: string }) => ({
      mediaUrl: m.mediaUrl || null,
      mediaType: m.mediaUrl ? m.mediaType ?? null : null,
      mediaSource: m.mediaUrl ? (m.mediaSource as any) ?? null : null,
    });

    if (questionId) {
      const question = await prisma.question.findUnique({ where: { id: questionId } });
      if (!question || question.groupId !== groupId) return { error: 'Pergunta nao encontrada' };
      await prisma.$transaction([
        prisma.option.deleteMany({ where: { questionId } }),
        prisma.question.update({
          where: { id: questionId },
          data: {
            text: data.text,
            ...normalizeMedia(data),
            options: {
              create: data.options.map((o) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                ...normalizeMedia(o),
              })),
            },
          },
        }),
      ]);
    } else {
      await prisma.question.create({
        data: {
          groupId,
          text: data.text,
          ...normalizeMedia(data),
          options: {
            create: data.options.map((o) => ({
              text: o.text,
              isCorrect: o.isCorrect,
              ...normalizeMedia(o),
            })),
          },
        },
      });
    }

    revalidatePath(`/admin/groups/${groupId}/questions`);
    revalidatePath(`/groups/${groupId}`);
    return { success: 'ok' };
  } catch {
    return { error: 'Nao foi possivel salvar a pergunta' };
  }
}

export async function deleteQuestionAction(groupId: string, questionId: string): Promise<QState> {
  try {
    const user = await requireUser();
    await canEdit(groupId, user.id);
    await prisma.question.delete({ where: { id: questionId } });
    revalidatePath(`/admin/groups/${groupId}/questions`);
    revalidatePath(`/groups/${groupId}`);
    return { success: 'ok' };
  } catch {
    return { error: 'Nao foi possivel excluir' };
  }
}
