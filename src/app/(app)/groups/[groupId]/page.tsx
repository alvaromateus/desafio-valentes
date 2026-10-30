import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/guards';
import { getGroupForUser } from '@/actions/groups';
import { getGroupRanking } from '@/actions/ranking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { rankMedal } from '@/components/gamification/rank-medal';
import { Users, HelpCircle, Settings, Trophy } from 'lucide-react';

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const user = await requireUser();
  const data = await getGroupForUser(groupId, user.id);
  if (!data) notFound();
  const { group, membership, canManage } = data;
  if (!membership) redirect('/groups');

  const ranking = await getGroupRanking(groupId);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <span className="text-4xl sm:text-5xl">{group.emoji}</span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">{group.name}</h1>
          {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{group._count.members} membros</span>
            <span className="inline-flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" />{group._count.questions} perguntas</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild size="lg" className="w-full sm:w-auto"><Link href={`/groups/${groupId}/quiz`}>▶︎ Jogar quiz</Link></Button>
        {canManage && (
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto"><Link href={`/admin/groups/${groupId}/questions`}><Settings className="h-4 w-4" /> Gerenciar</Link></Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Trophy className="h-5 w-5 text-neon-amber" />
          <CardTitle>Ranking</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {ranking.length === 0 && <p className="text-sm text-muted-foreground">Sem jogadores ainda.</p>}
          {ranking.map((r) => (
            <div key={r.userId} className={`flex items-center gap-2 rounded-2xl px-2.5 py-2 sm:gap-3 sm:px-3 ${r.userId === user.id ? 'bg-primary/10 ring-1 ring-primary/30' : ''}`}>
              <span className="w-7 text-center text-sm font-bold sm:w-8 sm:text-base">{rankMedal(r.position)}</span>
              <Avatar seed={r.avatarSeed} emoji={r.emoji} size={34} />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold sm:text-base">{r.username}{r.userId === user.id && ' (voce)'}</span>
              <span className="shrink-0 font-display text-sm font-bold text-gradient sm:text-base">{r.score} pts</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
