import { requireUser } from '@/lib/guards';
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { BADGE_DEFS } from '@/lib/scoring';

export default async function AchievementsPage() {
  const user = await requireUser();
  const earned = await prisma.userBadge.findMany({ where: { userId: user.id }, select: { badgeId: true } });
  const earnedSet = new Set(earned.map((e) => e.badgeId));
  const badges = await prisma.badge.findMany();

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Conquistas</h1>
        <p className="text-sm text-muted-foreground">Colecione badges respondendo o quiz.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((b) => {
          const has = earnedSet.has(b.id);
          return (
            <Card key={b.id} className={has ? '' : 'opacity-40 grayscale'}>
              <CardContent className="flex flex-col items-center gap-1 pt-6 text-center">
                <span className="text-4xl">{b.emoji}</span>
                <span className="font-display font-bold">{b.name}</span>
                <span className="text-xs text-muted-foreground">{b.description}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
