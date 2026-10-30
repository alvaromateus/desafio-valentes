"use server";

import { prisma } from '@/lib/db';

export async function getGroupRanking(groupId: string) {
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: { select: { id: true, username: true, avatarSeed: true, emoji: true } } },
    orderBy: [{ score: 'desc' }, { joinedAt: 'asc' }],
  });
  return members.map((m, i) => ({
    position: i + 1,
    userId: m.user.id,
    username: m.user.username,
    avatarSeed: m.user.avatarSeed ?? m.user.username,
    emoji: m.user.emoji,
    score: m.score,
  }));
}
