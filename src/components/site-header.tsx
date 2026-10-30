"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

interface Props {
  username: string;
  emoji?: string | null;
  isSuperAdmin: boolean;
}

const NAV = [
  { href: '/groups', label: 'Grupos' },
  { href: '/profile', label: 'Perfil' },
];

export function SiteHeader({ username, emoji, isSuperAdmin }: Props) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-border glass">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4">
        <Link href="/groups" className="flex shrink-0 items-center gap-2 font-display text-base font-extrabold sm:text-lg">
          <span className="text-xl sm:text-2xl">📖</span>
          <span className="text-gradient hidden md:inline">Desafio dos Valentes</span>
        </Link>
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'whitespace-nowrap rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors sm:px-3',
                pathname.startsWith(item.href)
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
          {isSuperAdmin && (
            <Link
              href="/super-admin"
              className={cn(
                'whitespace-nowrap rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors sm:px-3',
                pathname.startsWith('/super-admin')
                  ? 'bg-neon-pink/15 text-neon-pink'
                  : 'text-neon-pink/80 hover:text-neon-pink'
              )}
            >
              Admin
            </Link>
          )}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Avatar seed={username} emoji={emoji} size={32} ring />
          <span className="hidden text-sm font-semibold md:inline">{username}</span>
          <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: '/login' })} aria-label="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
