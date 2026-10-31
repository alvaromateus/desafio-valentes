"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/guards';

async function assertCanManage(groupId: string, userId: string) {
  const [group, user] = await Promise.all([
    prisma.group.findUnique({ where: { id: groupId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);
  if (!group) throw new Error('GRUPO_NAO_ENCONTRADO');
  if (group.adminId === userId) return group;
  if (user?.role === 'SUPER_ADMIN') return group;
  throw new Error('SEM_PERMISSAO');
}

export type AdminState = { error?: string; success?: string };

export async function removeMemberAction(groupId: string, memberUserId: string, reason: string): Promise<AdminState> {
  try {
    const user = await requireUser();
    const group = await assertCanManage(groupId, user.id);
    if (memberUserId === group.adminId) return { error: 'Nao e possivel remover o administrador' };
    if (!reason.trim()) return { error: 'Justificativa obrigatoria' };

    await prisma.$transaction([
      prisma.groupMember.deleteMany({ where: { groupId, userId: memberUserId } }),
      prisma.ban.upsert({
        where: { groupId_userId: { groupId, userId: memberUserId } },
        update: { reason: reason.trim(), bannedBy: user.id },
        create: { groupId, userId: memberUserId, reason: reason.trim(), bannedBy: user.id },
      }),
    ]);
    revalidatePath(`/admin/groups/${groupId}/members`);
    return { success: 'ok' };
  } catch {
    return { error: 'Nao foi possivel remover o membro' };
  }
}

export async function unbanAction(groupId: string, memberUserId: string): Promise<AdminState> {
  try {
    const user = await requireUser();
    await assertCanManage(groupId, user.id);
    await prisma.ban.deleteMany({ where: { groupId, userId: memberUserId } });
    revalidatePath(`/admin/groups/${groupId}/banned`);
    return { success: 'ok' };
  } catch {
    return { error: 'Nao foi possivel desbloquear' };
  }
}

export async function transferAdminAction(groupId: string, newAdminUserId: string): Promise<AdminState> {
  try {
    const user = await requireUser();
    const group = await assertCanManage(groupId, user.id);
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: newAdminUserId } },
    });
    if (!membership) return { error: 'Usuario nao e membro do grupo' };
    if (group.adminId === newAdminUserId) return { error: 'Usuario ja e administrador' };

    await prisma.group.update({ where: { id: groupId }, data: { adminId: newAdminUserId } });
    revalidatePath(`/admin/groups/${groupId}/admins`);
    revalidatePath('/groups');
    return { success: 'ok' };
  } catch {
    return { error: 'Nao foi possivel transferir a administracao' };
  }
}

export async function removeAdminAction(groupId: string, memberUserId: string): Promise<AdminState> {
  try {
    const user = await requireUser();
    await assertCanManage(groupId, user.id);

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return { error: 'Grupo nao encontrado' };
    if (group.adminId !== memberUserId) return { error: 'Usuario nao e administrador' };

    // A administracao volta para um super admin do sistema
    const superAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' }, orderBy: { createdAt: 'asc' } });
    if (!superAdmin) return { error: 'Nenhum super admin disponivel para assumir' };
    if (superAdmin.id === memberUserId) return { error: 'Nao e possivel remover o super admin' };

    await prisma.group.update({ where: { id: groupId }, data: { adminId: superAdmin.id } });
    revalidatePath('/admin/groups/' + groupId + '/admins');
    revalidatePath('/groups');
    return { success: 'ok' };
  } catch {
    return { error: 'Nao foi possivel remover a administracao' };
  }
}

export async function resetMemberScoreAction(groupId: string, memberUserId: string): Promise<AdminState> {
  try {
    const user = await requireUser();
    await assertCanManage(groupId, user.id);

    await prisma.$transaction([
      prisma.groupMember.updateMany({
        where: { groupId, userId: memberUserId },
        data: { score: 0 },
      }),
      prisma.attempt.deleteMany({
        where: { userId: memberUserId, question: { groupId } },
      }),
    ]);

    revalidatePath(`/admin/groups/${groupId}/members`);
    revalidatePath(`/groups/${groupId}`);
    return { success: 'ok' };
  } catch {
    return { error: 'Nao foi possivel zerar a pontuacao' };
  }
}
