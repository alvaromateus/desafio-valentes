"use client";

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createGroupAction, type GroupState } from '@/actions/groups';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { GROUP_EMOJIS } from '@/lib/emojis';

export function CreateGroupDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [emoji, setEmoji] = useState('📖');
  const [state, formAction] = useActionState<GroupState, FormData>(createGroupAction, {});

  useEffect(() => {
    if (state.success === 'ok') {
      toast.success('Grupo criado!');
      setOpen(false);
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Novo grupo
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-2 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-card p-5 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-4 font-display text-xl font-bold">Criar grupo</h2>
            <form action={formAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Emoji</Label>
                <EmojiPicker value={emoji} onChange={setEmoji} options={GROUP_EMOJIS} label="Escolher emoji do grupo" />
                <input type="hidden" name="emoji" value={emoji} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" placeholder="Turma dos Valentes" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Descricao</Label>
                <Textarea id="description" name="description" placeholder="Sobre o grupo..." />
              </div>
              {state.error && <p className="text-sm text-destructive">{state.error}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">Criar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
