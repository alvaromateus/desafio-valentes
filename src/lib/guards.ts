import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("NAO_AUTENTICADO");
  return session.user;
}

export async function requireSuperAdmin() {
  const user = await requireUser();
  if (user.role !== "SUPER_ADMIN") throw new Error("SEM_PERMISSAO");
  return user;
}

export async function assertGroupAdmin(groupId: string, userId: string) {
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw new Error("GRUPO_NAO_ENCONTRADO");
  if (group.adminId !== userId) throw new Error("SEM_PERMISSAO");
  return group;
}

export async function isGroupAdmin(groupId: string, userId: string) {
  const count = await prisma.group.count({
    where: { id: groupId, adminId: userId },
  });
  return count > 0;
}
