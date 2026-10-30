import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/guards';
import { getGroupForUser } from '@/actions/groups';
import { prisma } from '@/lib/db';
import { QuestionManager } from '@/components/admin/question-manager';

export default async function AdminQuestionsPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const user = await requireUser();
  const data = await getGroupForUser(groupId, user.id);
  if (!data?.canManage) notFound();

  const questions = await prisma.question.findMany({
    where: { groupId },
    orderBy: { order: 'asc' },
    include: { options: true },
  });

  return <QuestionManager groupId={groupId} questions={questions} />;
}
