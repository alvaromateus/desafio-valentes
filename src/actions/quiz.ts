"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/guards';
import { pointsForTry, MAX_TRIES, levelFromPoints } from '@/lib/scoring';
import { questionSchema } from '@/lib/validation';

type SubmitResult =
  | { status: 'correct'; points: number; triesUsed: number; correctOptionId: string }
  | { status: 'wrong'; triesUsed: number; remaining: number }
  | { status: 'exhausted'; triesUsed: number; correctOptionId: string; explanation?: string }
  | { status: 'already'; solved: boolean; pointsEarned: number }
  | { error: string };

export async function submitAnswer(questionId: string, optionId: string): Promise<SubmitResult> {
  const user = await requireUser();
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { options: true },
  });
  if (!question) return { error: 'Pergunta nao encontrada' };

  const correct = question.options.find((o) => o.isCorrect);
  if (!correct) return { error: 'Pergunta sem resposta correta' };

  let attempt = await prisma.attempt.findUnique({
    where: { userId_questionId: { userId: user.id, questionId } },
  });

  if (!attempt) {
    attempt = await prisma.attempt.create({ data: { userId: user.id, questionId } });
  }

  if (attempt.solved || attempt.triesUsed >= MAX_TRIES) {
    return { status: 'already', solved: attempt.solved, pointsEarned: attempt.pointsEarned };
  }

  const isCorrect = optionId === correct.id;
  const triesUsed = attempt.triesUsed + 1;

  if (isCorrect) {
    const points = pointsForTry(triesUsed);
    await prisma.$transaction([
      prisma.attempt.update({
        where: { id: attempt.id },
        data: { triesUsed, solved: true, pointsEarned: points },
      }),
      prisma.groupMember.updateMany({
        where: { groupId: question.groupId, userId: user.id },
        data: { score: { increment: points } },
      }),
      prisma.userStats.upsert({
        where: { userId: user.id },
        update: { totalPoints: { increment: points }, lastPlayed: new Date() },
        create: { userId: user.id, totalPoints: points, lastPlayed: new Date() },
      }),
    ]);
    await refreshLevelAndBadges(user.id);
    revalidatePath(`/groups/${question.groupId}`);
    return { status: 'correct', points, triesUsed, correctOptionId: correct.id };
  }

  const exhausted = triesUsed >= MAX_TRIES;
  await prisma.attempt.update({
    where: { id: attempt.id },
    data: { triesUsed, solved: false },
  });

  if (exhausted) {
    return { status: 'exhausted', triesUsed, correctOptionId: correct.id };
  }
  return { status: 'wrong', triesUsed, remaining: MAX_TRIES - triesUsed };
}

async function refreshLevelAndBadges(userId: string) {
  const stats = await prisma.userStats.findUnique({ where: { userId } });
  if (!stats) return;
  const level = levelFromPoints(stats.totalPoints);
  if (level !== stats.level) {
    await prisma.userStats.update({ where: { userId }, data: { level } });
  }
  await grantBadgeIfEligible(userId, 'first_correct');
  if (stats.totalPoints >= 100) await grantBadgeIfEligible(userId, 'hundred_club');
  if (level >= 5) await grantBadgeIfEligible(userId, 'level_5');
}

async function grantBadgeIfEligible(userId: string, code: string) {
  const badge = await prisma.badge.findUnique({ where: { code } });
  if (!badge) return;
  await prisma.userBadge.upsert({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
    update: {},
    create: { userId, badgeId: badge.id },
  });
}

