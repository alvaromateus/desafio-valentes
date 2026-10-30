"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MediaFields } from './media-fields';
import { saveQuestionAction } from '@/actions/questions';
import { cn } from '@/lib/utils';

type OptionDraft = { text: string; isCorrect: boolean; mediaUrl: string; mediaType: string; mediaSource: string };

export type QuestionDraft = {
  id: string | null;
  text: string;
  mediaUrl: string;
  mediaType: string;
  mediaSource: string;
  options: OptionDraft[];
};

const emptyOption = (): OptionDraft => ({ text: '', isCorrect: false, mediaUrl: '', mediaType: 'image', mediaSource: '' });

export const emptyQuestion = (): QuestionDraft => ({
  id: null,
  text: '',
  mediaUrl: '',
  mediaType: 'image',
  mediaSource: '',
  options: [emptyOption(), emptyOption()],
});

export function QuestionEditor({ groupId, initial, onDone }: { groupId: string; initial: QuestionDraft; onDone: () => void }) {
  const router = useRouter();
  const [draft, setDraft] = useState<QuestionDraft>(initial);
  const [busy, setBusy] = useState(false);

  function setOption(i: number, patch: Partial<OptionDraft>) {
    setDraft((d) => ({ ...d, options: d.options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)) }));
  }

  function selectCorrect(i: number) {
    setDraft((d) => ({ ...d, options: d.options.map((o, idx) => ({ ...o, isCorrect: idx === i })) }));
  }

  async function save() {
    if (!draft.text.trim()) { toast.error('Informe o enunciado'); return; }
    if (draft.options.length < 2) { toast.error('Minimo de 2 alternativas'); return; }
    if (!draft.options.some((o) => o.isCorrect)) { toast.error('Marque a alternativa correta'); return; }
    setBusy(true);
    const payload = {
      text: draft.text,
      mediaUrl: draft.mediaUrl,
      mediaType: draft.mediaUrl ? draft.mediaType : undefined,
      mediaSource: draft.mediaUrl ? draft.mediaSource : undefined,
      options: draft.options.map((o) => ({
        text: o.text,
        isCorrect: o.isCorrect,
        mediaUrl: o.mediaUrl,
        mediaType: o.mediaUrl ? o.mediaType : undefined,
        mediaSource: o.mediaUrl ? o.mediaSource : undefined,
      })),
    };
    const res = await saveQuestionAction(groupId, draft.id, payload);
    setBusy(false);
    if (res.error) { toast.error(res.error); return; }
    toast.success('Pergunta salva!');
    onDone();
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border glass p-4 sm:p-5">
      <div className="flex flex-col gap-1.5">
        <Label>Enunciado</Label>
        <textarea
          className="min-h-[80px] rounded-2xl border-2 border-input bg-background/60 px-4 py-3 text-sm"
          value={draft.text}
          onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
          placeholder="Digite a pergunta..."
        />
      </div>

      <MediaFields
        prefix="q"
        mediaUrl={draft.mediaUrl}
        mediaType={draft.mediaType}
        mediaSource={draft.mediaSource}
        onChange={(f, v) => setDraft((d) => ({ ...d, [f]: v }))}
      />

      <div className="flex flex-col gap-3">
        <Label>Alternativas</Label>
        {draft.options.map((o, i) => (
          <div key={i} className={cn('flex flex-col gap-2 rounded-2xl border-2 p-3', o.isCorrect ? 'border-neon-green' : 'border-border')}>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => selectCorrect(i)} className={cn('flex h-8 w-8 items-center justify-center rounded-full border-2', o.isCorrect ? 'border-neon-green bg-neon-green text-white' : 'border-muted-foreground/40')} aria-label="Marcar correta">
                {o.isCorrect && <Check className="h-4 w-4" />}
              </button>
              <Input value={o.text} onChange={(e) => setOption(i, { text: e.target.value })} placeholder={`Alternativa ${i + 1}`} />
              {draft.options.length > 2 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => setDraft((d) => ({ ...d, options: d.options.filter((_, idx) => idx !== i) }))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <MediaFields
              prefix={`o${i}`}
              mediaUrl={o.mediaUrl}
              mediaType={o.mediaType}
              mediaSource={o.mediaSource}
              onChange={(f, v) => setOption(i, { [f]: v } as Partial<OptionDraft>)}
            />
          </div>
        ))}
        {draft.options.length < 6 && (
          <Button type="button" variant="outline" onClick={() => setDraft((d) => ({ ...d, options: [...d.options, emptyOption()] }))}>
            <Plus className="h-4 w-4" /> Adicionar alternativa
          </Button>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>Cancelar</Button>
        <Button onClick={save} disabled={busy}>{busy ? 'Salvando...' : 'Salvar pergunta'}</Button>
      </div>
    </div>
  );
}
