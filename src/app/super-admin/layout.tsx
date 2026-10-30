import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SiteHeader } from '@/components/site-header';

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'SUPER_ADMIN') redirect('/groups');
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { emoji: true } });

  return (
    <div className="min-h-screen">
      <SiteHeader username={session.user.username} emoji={dbUser?.emoji} isSuperAdmin />
      <main className="mx-auto max-w-5xl px-3 py-5 sm:px-4 sm:py-6">
        <div className="mb-4">
          <h1 className="font-display text-2xl font-extrabold text-gradient sm:text-3xl">Painel Super Admin</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
