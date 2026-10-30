import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/guards';
import { getGroupForUser } from '@/actions/groups';
import { prisma } from '@/lib/db';
import { SiteHeader } from '@/components/site-header';

export default async function AdminGroupLayout({ children, params }: { children: React.ReactNode; params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const user = await requireUser();
  const data = await getGroupForUser(groupId, user.id);
  if (!data) notFound();
  if (!data.canManage) notFound();
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { emoji: true } });

  const tabs = [
    { href: `/admin/groups/${groupId}/questions`, label: 'Perguntas' },
    { href: `/admin/groups/${groupId}/members`, label: 'Membros' },
    { href: `/admin/groups/${groupId}/admins`, label: 'Admins' },
    { href: `/admin/groups/${groupId}/banned`, label: 'Bloqueados' },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader username={user.username} emoji={dbUser?.emoji} isSuperAdmin={user.role === 'SUPER_ADMIN'} />
      <main className="mx-auto max-w-5xl px-3 py-5 sm:px-4 sm:py-6">
        <div className="flex flex-col gap-5 sm:gap-6">
          <div>
            <Link href={`/groups/${groupId}`} className="text-sm text-muted-foreground hover:text-foreground">← Voltar ao grupo</Link>
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Gerenciar {data.group.emoji} {data.group.name}</h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <Link key={t.href} href={t.href} className="rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted sm:px-4">
                {t.label}
              </Link>
            ))}
          </nav>
          {children}
        </div>
      </main>
    </div>
  );
}
