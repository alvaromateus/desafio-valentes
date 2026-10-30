"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireUser, assertGroupAdmin, isGroupAdmin } from '@/lib/guards';

export type GroupState = { error?: string; success?: string };

export async function listJoinableGroups(userId: string) {
  const groups = await prisma.group.findMany({
    include: { members: { select: { userId: true } }, _count: { select: { members: true, questions: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const bans = await prisma.ban.findMany({ where: { userId }, select: { groupId: true } });
  const bannedIds = new Set(bans.map((b) => b.groupId));
  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    emoji: g.emoji,
    members: g._count.members,
    questions: g._count.questions,
    isMember: g.members.some((m) => m.userId === userId),
    isBanned: bannedIds.has(g.id),
    isAdmin: g.adminId === userId,
  }));
}

export async function joinGroupAction(groupId: string): Promise<GroupState> {
  try {
    const user = await requireUser();
    const ban = await prisma.ban.findUnique({ where: { groupId_userId: { groupId, userId: user.id } } });
    if (ban) return { error: 'Voce foi bloqueado deste grupo' };
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId, userId: user.id } },
      update: {},
      create: { groupId, userId: user.id },
    });
    revalidatePath('/groups');
    return { success: 'ok' };
  } catch {
    return { error: 'Nao foi possivel entrar no grupo' };
  }
}

export async function leaveGroupAction(groupId: string): Promise<GroupState> {
  try {
    const user = await requireUser();
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (group?.adminId === user.id) return { error: 'Administrador nao pode sair do grupo' };
    await prisma.groupMember.deleteMany({ where: { groupId, userId: user.id } });
    revalidatePath('/groups');
    return { success: 'ok' };
  } catch {
    return { error: 'Nao foi possivel sair do grupo' };
  }
}

export async function createGroupAction(prev: GroupState, formData: FormData): Promise<GroupState> {
  try {
    const user = await requireUser();
    const name = String(formData.get('name') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const emoji = String(formData.get('emoji') ?? '📖').trim() || '📖';
    if (name.length < 3) return { error: 'Nome muito curto' };
    const group = await prisma.group.create({
      data: { name, description: description || null, emoji, adminId: user.id },
    });
    await prisma.groupMember.create({ data: { groupId: group.id, userId: user.id } });
    revalidatePath('/groups');
    return { success: 'ok' };
  } catch {
    return { error: 'Nao foi possivel criar o grupo' };
  }
}

export async function getGroupForUser(groupId: string, userId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { admin: { select: { id: true, username: true } }, _count: { select: { members: true, questions: true } } },
  });
  if (!group) return null;
  const membership = await prisma.groupMember.findUnique({ where: { groupId_userId: { groupId, userId } } });
  const isAdmin = group.adminId === userId;
  const superAdmin = (await prisma.user.findUnique({ where: { id: userId } }))?.role === 'SUPER_ADMIN';
  return { group, membership, isAdmin, canManage: isAdmin || superAdmin, superAdmin };
}

export async function isAdminOf(groupId: string, userId: string) {
  return isGroupAdmin(groupId, userId);
}
