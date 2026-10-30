"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Check, X, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TriesIndicator } from '@/components/gamification/tries-indicator';
import { fireConfetti } from '@/components/gamification/confetti';
import { MediaView } from './media-view';
import { submitAnswer } from '@/actions/quiz';
import { cn } from '@/lib/utils';

type OptionDTO = { id: string; text: string; mediaUrl: string | null; mediaType: string | null; mediaSource: string | null };
type QuestionDTO = {
  id: string; text: string; mediaUrl: string | null; mediaType: string | null; mediaSource: string | null;
  options: OptionDTO[]; triesUsed: number; solved: boolean; finished: boolean;
};

type Phase = 'idle' | 'correct' | 'wrong' | 'exhausted' | 'done';

export function QuizPlayer({ groupId, groupName, questions }: { groupId: string; groupName: string; questions: QuestionDTO[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(() => questions.findIndex((q) => !q.finished) === -1 ? 0 : questions.findIndex((q) => !q.finished));
  const [current, setCurrent] = useState<QuestionDTO>(questions[index]);
  const [tries, setTries] = useState(current?.triesUsed ?? 0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [selected, setSelected] = useState<string | null>(null);
  const [correctId, setCorrectId] = useState<string | null>(null);
  const [lastPoints, setLastPoints] = useState(0);
  const [busy, setBusy] = useState(false);

  if (!current) {
    return (
      <EmptyState groupId={groupId} />
    );
  }

  function goTo(i: number) {
    const q = questions[i];
    setIndex(i);
    setCurrent(q);
    setTries(q.triesUsed);
    setSelected(null);
    setCorrectId(null);
    setPhase(q.finished ? 'done' : 'idle');
  }

  async function choose(optionId: string) {
    if (busy || phase === 'correct' || phase === 'exhausted' || phase === 'done') return;
    setBusy(true);
    setSelected(optionId);
    const res = await submitAnswer(current.id, optionId);
    setBusy(false);

    if ('error' in res) { toast.error(res.error); setSelected(null); return; }

    if (res.status === 'correct') {
      setCorrectId(res.correctOptionId);
      setLastPoints(res.points);
      setTries(res.triesUsed);
      setPhase('correct');
      fireConfetti();
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
    } else if (res.status === 'wrong') {
      setTries(res.triesUsed);
      setPhase('wrong');
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([20, 40, 20]);
      setTimeout(() => { setSelected(null); setPhase('idle'); }, 900);
    } else if (res.status === 'exhausted' || res.status === 'already') {
      const cid = 'correctOptionId' in res ? res.correctOptionId : null;
      setCorrectId(cid);
      setTries(3);
      setPhase(res.status === 'exhausted' ? 'exhausted' : 'done');
    }
  }

  const isLast = index === questions.length - 1;

  function next() {
    const nextIndex = questions.findIndex((q, i) => i > index && !q.finished);
    if (nextIndex !== -1) { goTo(nextIndex); return; }
    if (!isLast) { goTo(index + 1); return; }
    router.push(`/groups/${groupId}`);
    router.refresh();
  }

  function optionState(optionId: string): string {
    if (phase === 'correct') {
      if (optionId === correctId) return 'correct';
      if (optionId === selected) return 'wrong';
      return 'idle';
    }
    if (phase === 'exhausted' || phase === 'done') {
      if (optionId === correctId) return 'correct';
      return 'idle';
    }
    if (phase === 'wrong' && optionId === selected) return 'wrong';
    return 'idle';
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-5">
      <div className="flex items-center justify-between gap-2">
        <Link href={`/groups/${groupId}`} className="truncate text-sm text-muted-foreground hover:text-foreground">
          ← {groupName}
        </Link>
        <span className="shrink-0 text-sm font-semibold text-muted-foreground">{index + 1}/{questions.length}</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan" animate={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <TriesIndicator triesUsed={tries} />
            {phase === 'correct' && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-full bg-neon-green/15 px-3 py-1 text-sm font-bold text-neon-green">
                +{lastPoints} pts
              </motion.span>
            )}
          </div>

          <div className="rounded-3xl border border-border glass p-4 sm:p-6">
            <h2 className="mb-3 font-display text-lg font-bold leading-snug sm:mb-4 sm:text-xl">{current.text}</h2>
            <MediaView mediaUrl={current.mediaUrl} mediaType={current.mediaType} mediaSource={current.mediaSource} />
          </div>

          <div className="flex flex-col gap-2.5">
            {current.options.map((opt) => {
              const st = optionState(opt.id);
              return (
                <motion.button
                  key={opt.id}
                  onClick={() => choose(opt.id)}
                  disabled={busy || phase === 'correct' || phase === 'exhausted' || phase === 'done'}
                  animate={st === 'wrong' ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    'flex min-h-[3.5rem] items-center gap-3 rounded-2xl border-2 p-3.5 text-left text-sm font-semibold transition-all sm:min-h-[4rem] sm:p-4 sm:text-base',
                    st === 'idle' && 'border-border bg-card hover:border-primary/50 hover:bg-primary/5',
                    st === 'correct' && 'border-neon-green bg-neon-green/15 text-neon-green',
                    st === 'wrong' && 'border-neon-red bg-neon-red/15 text-neon-red'
                  )}
                >
                  <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                    st === 'correct' && 'border-neon-green',
                    st === 'wrong' && 'border-neon-red',
                    st === 'idle' && 'border-muted-foreground/40'
                  )}>
                    {st === 'correct' ? <Check className="h-4 w-4" /> : st === 'wrong' ? <X className="h-4 w-4" /> : current.options.indexOf(opt) + 1}
                  </span>
                  <span className="flex-1">{opt.text}</span>
                  {(opt.mediaUrl) && (
                    <span className="w-16 shrink-0">
                      <MediaView mediaUrl={opt.mediaUrl} mediaType={opt.mediaType} mediaSource={opt.mediaSource} />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {(phase === 'correct' || phase === 'exhausted' || phase === 'done') && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
              {phase === 'correct' && (
                <p className="rounded-2xl bg-neon-green/10 px-4 py-3 text-center text-sm font-bold text-neon-green">
                  Acertou! +{lastPoints} pontos
                </p>
              )}
              {phase === 'exhausted' && (
                <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-center text-sm font-bold text-destructive">
                  Resposta revelada. Voce nao ganhou pontos desta vez.
                </p>
              )}
              {phase === 'done' && current.solved && (
                <p className="text-center text-sm text-muted-foreground">Voce ja acertou esta pergunta.</p>
              )}
              <Button size="lg" onClick={next}>
                {isLast ? (<><Home className="h-4 w-4" /> Concluir</>) : (<>Proxima <ArrowRight className="h-4 w-4" /></>)}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ groupId }: { groupId: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-dashed border-border p-10 text-center">
      <span className="text-5xl">🎉</span>
      <p className="font-display text-lg font-bold">Sem perguntas por aqui</p>
      <p className="text-sm text-muted-foreground">O administrador ainda nao adicionou perguntas a este grupo.</p>
      <Button asChild><Link href={`/groups/${groupId}`}>Voltar</Link></Button>
    </div>
  );
}
