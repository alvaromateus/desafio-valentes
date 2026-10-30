import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, HelpCircle, Crown } from 'lucide-react';

export default async function SuperAdminPage() {
  const session = await auth();
  if (session?.user?.role !== 'SUPER_ADMIN') redirect('/login');

  const [groups, userCount, questionCount] = await Promise.all([
    prisma.group.findMany({
      include: {
        admin: { select: { username: true } },
        _count: { select: { members: true, questions: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
    prisma.question.count(),
  ]);

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="Grupos" value={groups.length} />
        <Stat label="Usuarios" value={userCount} />
        <Stat label="Perguntas" value={questionCount} />
      </div>

      <Card>
        <CardHeader><CardTitle>Todos os grupos</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-2">
          {groups.length === 0 && <p className="text-sm text-muted-foreground">Nenhum grupo criado.</p>}
          {groups.map((g) => (
            <div key={g.id} className="flex flex-wrap items-center gap-2 rounded-2xl bg-muted/40 px-3 py-3 sm:gap-3 sm:px-4">
              <span className="text-2xl">{g.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{g.name}</p>
                <p className="truncate text-xs text-muted-foreground">Admin: {g.admin.username}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />{g._count.members}</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><HelpCircle className="h-3.5 w-3.5" />{g._count.questions}</span>
              <Link href={`/admin/groups/${g.id}/questions`} className="text-sm font-semibold text-neon-cyan hover:underline">Editar</Link>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Promover administradores</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Abra o grupo e use a aba <Badge variant="outline"><Crown className="mr-1 h-3 w-3" />Admins</Badge> para conceder administracao a um membro. Super admins tambem podem gerenciar qualquer grupo diretamente.
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border glass p-4">
      <span className="font-display text-2xl font-extrabold text-gradient sm:text-3xl">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
