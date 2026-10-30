"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSuperAdmin } from '@/lib/guards';

export type SAState = { error?: string; success?: string };

export async function promoteGroupAdminAction(groupId: string, userId: string): Promise<SAState> {
  try {
    await requireSuperAdmin();
    const membership = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } });
    if (!membership) return { error: 'Usuario nao e membro do grupo' };
    await prisma.group.update({ where: { id: groupId }, data: { adminId: userId } });
    revalidatePath('/super-admin');
    return { success: 'ok' };
  } catch {
    return { error: 'Sem permissao' };
  }
}

// Already covered by assertCanManage super admin branch, but explicit global list for the panel
export async function listAllGroups() {
  await requireSuperAdmin();
  return prisma.group.findMany({
    include: {
      admin: { select: { id: true, username: true } },
      _count: { select: { members: true, questions: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
