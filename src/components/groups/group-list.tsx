"use client";

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Users, HelpCircle, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { joinGroupAction, leaveGroupAction } from '@/actions/groups';

type GroupItem = {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  members: number;
  questions: number;
  isMember: boolean;
  isBanned: boolean;
  isAdmin: boolean;
};

export function GroupList({ groups, emptyMessage }: { groups: GroupItem[]; emptyMessage?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  function join(id: string) {
    setBusyId(id);
    startTransition(async () => {
      const res = await joinGroupAction(id);
      if (res.error) toast.error(res.error);
      else { toast.success('Voce entrou no grupo!'); router.refresh(); }
      setBusyId(null);
    });
  }

  function leave(id: string) {
    setBusyId(id);
    startTransition(async () => {
      const res = await leaveGroupAction(id);
      if (res.error) toast.error(res.error);
      else { toast.success('Voce saiu do grupo'); router.refresh(); }
      setBusyId(null);
    });
  }

  if (groups.length === 0) {
    if (!emptyMessage) return null;
    return (
      <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {groups.map((g, i) => (
        <motion.div
          key={g.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex flex-col rounded-3xl border border-border glass p-4 sm:p-5"
        >
          <div className="flex items-start gap-3">
            <span className="text-4xl">{g.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-display text-lg font-bold">{g.name}</h3>
                {g.isAdmin && <Crown className="h-4 w-4 text-neon-amber" />}
              </div>
              {g.description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">{g.description}</p>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{g.members} membros</span>
            <span className="inline-flex items-center gap-1"><HelpCircle className="h-3.5 w-3.5" />{g.questions} perguntas</span>
            {g.isBanned && <Badge variant="warning"><Lock className="mr-1 h-3 w-3" />Bloqueado</Badge>}
          </div>

          <div className="mt-4 flex gap-2">
            {g.isMember ? (
              <>
                <Button asChild className="flex-1"><Link href={`/groups/${g.id}`}>Abrir</Link></Button>
                {!g.isAdmin && (
                  <Button variant="outline" onClick={() => leave(g.id)} disabled={busyId === g.id}>Sair</Button>
                )}
              </>
            ) : (
              <Button className="flex-1" onClick={() => join(g.id)} disabled={g.isBanned || busyId === g.id}>
                {g.isBanned ? 'Bloqueado' : 'Entrar'}
              </Button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
