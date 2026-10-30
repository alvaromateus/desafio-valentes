import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/guards';
import { getGroupForUser } from '@/actions/groups';
import { prisma } from '@/lib/db';
import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { TransferAdminButton, RemoveAdminButton } from '@/components/admin/admin-actions';

export default async function AdminsPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const user = await requireUser();
  const data = await getGroupForUser(groupId, user.id);
  if (!data?.canManage) notFound();

  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: { select: { id: true, username: true, avatarSeed: true, emoji: true, role: true } } },
    orderBy: [{ score: 'desc' }],
  });

  const currentAdminId = data.group.adminId;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">Conceda a administracao a um membro ou remova o administrador atual.</p>
      {members.map((m) => {
        const isCurrentAdmin = m.user.id === currentAdminId;
        const isSuper = m.user.role === 'SUPER_ADMIN';
        return (
          <Card key={m.id}>
            <CardContent className="flex flex-wrap items-center gap-2 p-4 sm:gap-3 sm:p-6">
              <Avatar seed={m.user.avatarSeed ?? m.user.username} emoji={m.user.emoji} size={40} />
              <span className="min-w-0 flex-1 truncate font-semibold">
                {m.user.username}{isCurrentAdmin && ' (admin atual)'}
              </span>
              {isCurrentAdmin ? (
                isSuper ? (
                  <span className="text-xs text-muted-foreground">Super admin</span>
                ) : (
                  <RemoveAdminButton groupId={groupId} userId={m.user.id} username={m.user.username} />
                )
              ) : (
                <TransferAdminButton groupId={groupId} userId={m.user.id} username={m.user.username} />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
