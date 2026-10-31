import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getPublicSummary } from '@/actions/public';
import { PublicSummary } from '@/components/landing/public-summary';
import { AuthForm } from '@/components/auth/auth-form';
import { loginAction } from '@/actions/auth';

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect('/groups');

  const summary = await getPublicSummary();

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <span className="text-5xl">📖</span>
        <h1 className="font-display text-3xl font-extrabold text-gradient sm:text-4xl">Desafio dos Valentes</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Quiz biblico gamificado por grupos. Responda, pontue e suba no ranking!
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-bold">O que esta acontecendo</h2>
          <PublicSummary summary={summary} />
        </div>

        <div className="rounded-3xl border border-border glass p-5 sm:p-6">
          <h2 className="mb-1 font-display text-2xl font-bold">Entrar</h2>
          <p className="mb-6 text-sm text-muted-foreground">Acesse para jogar e competir.</p>
          <AuthForm mode="login" action={loginAction} />
        </div>
      </div>
    </div>
  );
}
