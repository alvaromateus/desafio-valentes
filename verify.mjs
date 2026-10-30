import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const qs = await prisma.question.findMany({ where: { mediaUrl: { not: null } }, select: { mediaUrl: true, mediaSource: true } });
let bad = 0;
for (const q of qs) {
  let url = q.mediaUrl;
  let check = url;
  if (q.mediaSource === 'YOUTUBE') {
    const id = url.match(/v=([A-Za-z0-9_-]{11})/)?.[1];
    check = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
  }
  const code = await fetch(check, { redirect: 'follow' }).then(r => r.status).catch(() => 0);
  const ok = code === 200;
  if (!ok) bad++;
  console.log(ok ? 'OK ' : 'BAD', code, q.mediaSource, url.slice(0, 70));
}
console.log('\nTotal:', qs.length, '| Quebrados:', bad);
await prisma.$disconnect();
