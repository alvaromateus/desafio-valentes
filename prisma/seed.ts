import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BADGE_DEFS } from "../src/lib/scoring";
import { IEQ_QUESTIONS, IEQ_GROUP_NAME } from "./questions-data";

const prisma = new PrismaClient();

async function main() {
  const username = (process.env.SUPER_ADMIN_USERNAME ?? "superadmin").toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD ?? "super123";
  const phone = process.env.SUPER_ADMIN_PHONE ?? "11999999999";

  const hash = await bcrypt.hash(password, 10);

  const superAdmin = await prisma.user.upsert({
    where: { username },
    update: { role: "SUPER_ADMIN", password: hash, phone },
    create: {
      username,
      password: hash,
      phone,
      role: "SUPER_ADMIN",
      emoji: "🦁",
      avatarSeed: "superadmin",
    },
  });

  await prisma.userStats.upsert({
    where: { userId: superAdmin.id },
    update: {},
    create: { userId: superAdmin.id },
  });

  for (const b of BADGE_DEFS) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: { name: b.name, description: b.description, emoji: b.emoji },
      create: b,
    });
  }

  // ----- Grupo de exemplo "10 IEQ" com perguntas biblicas -----
  let ieqGroup = await prisma.group.findFirst({
    where: { name: IEQ_GROUP_NAME, adminId: superAdmin.id },
  });
  if (!ieqGroup) {
    ieqGroup = await prisma.group.create({
      data: {
        name: IEQ_GROUP_NAME,
        description: 'Grupo de estudo biblico da classe 10 IEQ. 30 perguntas para desafiar a turma!',
        emoji: '⛪',
        adminId: superAdmin.id,
      },
    });
  } else {
    await prisma.question.deleteMany({ where: { groupId: ieqGroup.id } });
  }

  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: ieqGroup.id, userId: superAdmin.id } },
    update: {},
    create: { groupId: ieqGroup.id, userId: superAdmin.id },
  });

  let order = 0;
  for (const q of IEQ_QUESTIONS) {
    await prisma.question.create({
      data: {
        groupId: ieqGroup.id,
        text: q.text,
        mediaUrl: q.mediaUrl ?? null,
        mediaType: q.mediaType ?? null,
        mediaSource: q.mediaSource ?? null,
        order: order++,
        options: {
          create: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
        },
      },
    });
  }

  console.log(`Super admin pronto: ${username}`);
  console.log(`${BADGE_DEFS.length} badges garantidas.`);
  console.log(`Grupo '${IEQ_GROUP_NAME}' com ${IEQ_QUESTIONS.length} perguntas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
