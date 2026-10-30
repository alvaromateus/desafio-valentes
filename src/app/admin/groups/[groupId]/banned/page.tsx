import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/guards';
import { getGroupForUser } from '@/actions/groups';
import { prisma } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { UnbanButton } from '@/components/admin/admin-actions';

export default async function BannedPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const user = await requireUser();
  const data = await getGroupForUser(groupId, user.id);
  if (!data?.canManage) notFound();

  const bans = await prisma.ban.findMany({
    where: { groupId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex flex-col gap-3">
      {bans.length === 0 && <p className="rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">Nenhum membro bloqueado.</p>}
      {bans.map((b) => (
        <Card key={b.id}>
          <CardContent className="flex items-center gap-2 p-4 sm:gap-3 sm:p-6">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{b.user?.username ?? b.userId}</p>
              <p className="text-xs text-muted-foreground">Motivo: {b.reason}</p>
            </div>
            <UnbanButton groupId={groupId} userId={b.userId} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
