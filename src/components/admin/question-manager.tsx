"use client";

import { useState, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QuestionEditor, emptyQuestion, type QuestionDraft } from './question-editor';
import { MediaView } from '@/components/quiz/media-view';
import { deleteQuestionAction } from '@/actions/questions';

type QItem = {
  id: string;
  text: string;
  mediaUrl: string | null;
  mediaType: string | null;
  mediaSource: string | null;
  options: { id: string; text: string; isCorrect: boolean; mediaUrl: string | null; mediaType: string | null; mediaSource: string | null }[];
};

export function QuestionManager({ groupId, questions }: { groupId: string; questions: QItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<QuestionDraft | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing && editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editing]);

  function startEdit(draft: QuestionDraft) {
    setEditing(null);
    requestAnimationFrame(() => setEditing(draft));
  }

  function toDraft(q: QItem): QuestionDraft {
    return {
      id: q.id,
      text: q.text,
      mediaUrl: q.mediaUrl ?? '',
      mediaType: q.mediaType ?? 'image',
      mediaSource: q.mediaSource ?? '',
      options: q.options.map((o) => ({
        text: o.text,
        isCorrect: o.isCorrect,
        mediaUrl: o.mediaUrl ?? '',
        mediaType: o.mediaType ?? 'image',
        mediaSource: o.mediaSource ?? '',
      })),
    };
  }

  async function remove(id: string) {
    if (!confirm('Excluir esta pergunta?')) return;
    const res = await deleteQuestionAction(groupId, id);
    if (res.error) toast.error(res.error);
    else { toast.success('Pergunta excluida'); router.refresh(); }
  }

  return (
    <div className="flex flex-col gap-4">
      {!editing && (
        <Button onClick={() => startEdit(emptyQuestion())}>
          <Plus className="h-4 w-4" /> Nova pergunta
        </Button>
      )}
      <div ref={editorRef} className="scroll-mt-20">
        {editing && (
          <QuestionEditor groupId={groupId} initial={editing} onDone={() => setEditing(null)} />
        )}
      </div>

      {questions.length === 0 && !editing && (
        <p className="rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Nenhuma pergunta ainda.
        </p>
      )}

      {questions.map((q) => (
        <Card key={q.id}>
          <CardContent className="flex flex-col gap-3 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 flex-1 font-semibold">{q.text}</p>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => startEdit(toDraft(q))}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
            {q.mediaUrl && <MediaView mediaUrl={q.mediaUrl} mediaType={q.mediaType} mediaSource={q.mediaSource} />}
            <ul className="flex flex-col gap-1 text-sm">
              {q.options.map((o) => (
                <li key={o.id} className={o.isCorrect ? 'font-bold text-neon-green' : 'text-muted-foreground'}>
                  {o.isCorrect ? '✓ ' : '• '}{o.text}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
