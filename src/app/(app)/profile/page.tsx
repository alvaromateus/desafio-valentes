import { requireUser } from '@/lib/guards';
import { prisma } from '@/lib/db';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XPBar } from '@/components/gamification/xp-bar';
import { Badge } from '@/components/ui/badge';
import { levelTitle } from '@/lib/scoring';
import { Flame, Trophy, Star } from 'lucide-react';

export default async function ProfilePage() {
  const user = await requireUser();
  const [dbUser, stats, badges, memberships] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id } }),
    prisma.userStats.findUnique({ where: { userId: user.id } }),
    prisma.userBadge.findMany({ where: { userId: user.id }, include: { badge: true }, orderBy: { earnedAt: 'desc' } }),
    prisma.groupMember.findMany({ where: { userId: user.id }, include: { group: true } }),
  ]);
  const points = stats?.totalPoints ?? 0;

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="flex items-center gap-4 sm:gap-5">
        <Avatar seed={dbUser?.avatarSeed ?? dbUser?.username ?? 'anon'} emoji={dbUser?.emoji} size={72} ring className="shrink-0 sm:!h-24 sm:!w-24" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-2xl font-extrabold sm:text-3xl">{dbUser?.username}</h1>
          <p className="text-sm text-muted-foreground">{levelTitle(stats?.level ?? 1)} · Nivel {stats?.level ?? 1}</p>
          <div className="mt-3"><XPBar points={points} /></div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard icon={<Star className="h-5 w-5 text-neon-cyan" />} label="Pontos" value={points} />
        <StatCard icon={<Flame className="h-5 w-5 text-neon-pink" />} label="Streak" value={`${stats?.streakDays ?? 0}d`} />
        <StatCard icon={<Trophy className="h-5 w-5 text-neon-amber" />} label="Badges" value={badges.length} />
      </div>

      <Card>
        <CardHeader><CardTitle>Conquistas</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {badges.length === 0 && <p className="text-sm text-muted-foreground">Jogue para conquistar badges!</p>}
          {badges.map((b) => (
            <Badge key={b.id} variant="warning" className="text-sm">{b.badge.emoji} {b.badge.name}</Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Meus grupos</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {memberships.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-2">
              <span className="font-semibold">{m.group.emoji} {m.group.name}</span>
              <span className="font-display font-bold text-gradient">{m.score} pts</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border glass p-3 sm:p-4">
      {icon}
      <span className="font-display text-xl font-extrabold sm:text-2xl">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
