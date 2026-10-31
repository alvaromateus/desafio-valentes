import { prisma } from '@/lib/db';

export async function getPublicSummary() {
  const [groups, recentAnswerers, totals] = await Promise.all([
    prisma.group.findMany({
      select: {
        id: true,
        name: true,
        emoji: true,
        createdAt: true,
        _count: { select: { members: true, questions: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.attempt.groupBy({
      by: ['userId'],
      _max: { updatedAt: true },
      _count: { _all: true },
      _sum: { pointsEarned: true },
      orderBy: { _max: { updatedAt: 'desc' } },
      take: 8,
    }),
    Promise.all([
      prisma.user.count(),
      prisma.group.count(),
      prisma.question.count(),
    ]),
  ]);

  const userIds = recentAnswerers.map((r) => r.userId);
  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, username: true, emoji: true },
      })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  return {
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      emoji: g.emoji,
      members: g._count.members,
      questions: g._count.questions,
    })),
    answerers: recentAnswerers
      .map((r) => ({
        username: userMap.get(r.userId)?.username ?? 'anonimo',
        emoji: userMap.get(r.userId)?.emoji ?? '😀',
        answered: r._count._all,
        points: r._sum.pointsEarned ?? 0,
      }))
      .filter((r) => r.username !== 'anonimo'),
    totals: { users: totals[0], groups: totals[1], questions: totals[2] },
  };
}
