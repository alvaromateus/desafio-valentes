import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/guards';
import { getGroupForUser } from '@/actions/groups';
import { prisma } from '@/lib/db';
import { QuizPlayer } from '@/components/quiz/quiz-player';

export default async function QuizPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const user = await requireUser();
  const data = await getGroupForUser(groupId, user.id);
  if (!data) notFound();
  if (!data.membership) redirect('/groups');

  const questions = await prisma.question.findMany({
    where: { groupId },
    orderBy: { order: 'asc' },
    include: { options: { select: { id: true, text: true, mediaUrl: true, mediaType: true, mediaSource: true } } },
  });

  const attempts = await prisma.attempt.findMany({ where: { userId: user.id, question: { groupId } } });
  const attemptMap = new Map(attempts.map((a) => [a.questionId, a]));

  const payload = questions.map((q) => {
    const a = attemptMap.get(q.id);
    return {
      id: q.id,
      text: q.text,
      mediaUrl: q.mediaUrl,
      mediaType: q.mediaType,
      mediaSource: q.mediaSource,
      options: shuffle(q.options),
      triesUsed: a?.triesUsed ?? 0,
      solved: a?.solved ?? false,
      finished: a ? (a.solved || a.triesUsed >= 3) : false,
    };
  });

  return (
    <QuizPlayer groupId={groupId} groupName={data.group.name} questions={shuffle(payload)} />
  );
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
