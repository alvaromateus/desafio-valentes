"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserMinus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { removeMemberAction, resetMemberScoreAction } from '@/actions/admin';

export function RemoveMemberButton({ groupId, userId, username }: { groupId: string; userId: string; username: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  async function confirm() {
    if (!reason.trim()) { toast.error('Informe a justificativa'); return; }
    setBusy(true);
    const res = await removeMemberAction(groupId, userId, reason);
    setBusy(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success(`${username} foi removido e bloqueado`);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}><UserMinus className="h-4 w-4 text-destructive" /></Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-2 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-card p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-1 font-display text-lg font-bold">Remover {username}</h2>
            <p className="mb-4 text-sm text-muted-foreground">Ele sera bloqueado e nao podera reingressar sem desbloqueio. Informe a justificativa.</p>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo da remocao" />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={confirm} disabled={busy}>Remover e bloquear</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ResetScoreButton({ groupId, userId, username }: { groupId: string; userId: string; username: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function go() {
    if (!confirm(`Zerar a pontuacao de ${username}? Isso apaga o progresso dele neste grupo.`)) return;
    setBusy(true);
    const res = await resetMemberScoreAction(groupId, userId);
    setBusy(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success(`Pontuacao de ${username} zerada`);
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={go} disabled={busy} title="Zerar pontuacao">
      <RotateCcw className="h-4 w-4 text-neon-amber" />
    </Button>
  );
}
