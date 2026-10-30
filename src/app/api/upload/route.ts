import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireUser } from '@/lib/guards';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_VIDEO = 25 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    await requireUser();
  } catch {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get('file');
  const kind = String(form.get('kind') ?? 'image');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 });
  }

  const isImage = kind === 'image';
  const max = isImage ? MAX_IMAGE : MAX_VIDEO;
  if (file.size > max) {
    return NextResponse.json({ error: `Arquivo excede o limite de ${Math.round(max / 1024 / 1024)}MB` }, { status: 400 });
  }
  if (isImage && !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Arquivo nao e uma imagem' }, { status: 400 });
  }
  if (!isImage && !file.type.startsWith('video/')) {
    return NextResponse.json({ error: 'Arquivo nao e um video' }, { status: 400 });
  }

  const ext = (file.name.split('.').pop() ?? (isImage ? 'png' : 'mp4')).replace(/[^a-z0-9]/gi, '').slice(0, 5);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // Producao (Vercel): usa Vercel Blob quando o token estiver configurado
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${filename}`, file, {
      access: 'public',
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({ url: blob.url, type: isImage ? 'image' : 'video' });
  }

  // Desenvolvimento local: salva em public/uploads
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);
  return NextResponse.json({ url: `/uploads/${filename}`, type: isImage ? 'image' : 'video' });
}
