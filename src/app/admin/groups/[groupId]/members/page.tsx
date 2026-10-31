import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/guards';
import { getGroupForUser } from '@/actions/groups';
import { prisma } from '@/lib/db';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { RemoveMemberButton, ResetScoreButton } from '@/components/admin/member-actions';
import { Phone } from 'lucide-react';

export default async function MembersPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const user = await requireUser();
  const data = await getGroupForUser(groupId, user.id);
  if (!data?.canManage) notFound();

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: { select: { id: true, username: true, phone: true, avatarSeed: true, emoji: true } } },
    orderBy: [{ score: 'desc' }],
  });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">O telefone e visivel apenas para administradores.</p>
      {members.map((m) => (
        <Card key={m.id}>
          <CardContent className="flex items-center gap-2 p-4 sm:gap-3 sm:p-6">
            <Avatar seed={m.user.avatarSeed ?? m.user.username} emoji={m.user.emoji} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{m.user.username}{m.user.id === data.group.adminId && ' 👑'}</p>
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{m.user.phone}</p>
            </div>
            <span className="shrink-0 font-display text-sm font-bold text-gradient sm:text-base">{m.score} pts</span>
            {m.user.id !== data.group.adminId && (
              <>
                <ResetScoreButton groupId={groupId} userId={m.user.id} username={m.user.username} />
                <RemoveMemberButton groupId={groupId} userId={m.user.id} username={m.user.username} />
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
