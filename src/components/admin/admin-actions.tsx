"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Crown, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { unbanAction, transferAdminAction, removeAdminAction } from '@/actions/admin';

export function TransferAdminButton({ groupId, userId, username, disabled }: { groupId: string; userId: string; username: string; disabled?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function go() {
    if (!confirm(`Tornar ${username} administrador do grupo?`)) return;
    setBusy(true);
    const res = await transferAdminAction(groupId, userId);
    setBusy(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success(`${username} agora e administrador`);
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={go} disabled={busy || disabled}>
      <Crown className="h-4 w-4" /> Tornar admin
    </Button>
  );
}

export function UnbanButton({ groupId, userId }: { groupId: string; userId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    const res = await unbanAction(groupId, userId);
    setBusy(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success('Usuario desbloqueado');
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={go} disabled={busy}>
      <Unlock className="h-4 w-4" /> Desbloquear
    </Button>
  );
}

export function RemoveAdminButton({ groupId, userId, username }: { groupId: string; userId: string; username: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function go() {
    if (!confirm(`Remover a administracao de ${username}? A administracao volta para o super admin.`)) return;
    setBusy(true);
    const res = await removeAdminAction(groupId, userId);
    setBusy(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success(`Administracao de ${username} removida`);
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={go} disabled={busy}>
      <Crown className="h-4 w-4" /> Remover admin
    </Button>
  );
}
