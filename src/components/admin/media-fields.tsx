"use client";

import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MediaView } from '@/components/quiz/media-view';

interface Props {
  prefix: string;
  mediaUrl: string;
  mediaType: string;
  mediaSource: string;
  onChange: (field: 'mediaUrl' | 'mediaType' | 'mediaSource', value: string) => void;
}

export function MediaFields({ prefix, mediaUrl, mediaType, mediaSource, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    const kind = mediaType === 'video' ? 'video' : 'image';
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('kind', kind);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Falha no upload');
        return;
      }
      onChange('mediaSource', 'UPLOAD');
      onChange('mediaType', data.type === 'video' ? 'video' : 'image');
      onChange('mediaUrl', data.url);
      toast.success('Arquivo enviado');
    } catch {
      toast.error('Falha no upload');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-dashed border-border p-3">
      <Label>Midia (opcional)</Label>
      <select
        className="h-10 rounded-xl border-2 border-input bg-background px-3 text-sm"
        value={mediaSource}
        onChange={(e) => onChange('mediaSource', e.target.value)}
      >
        <option value="">Sem midia</option>
        <option value="UPLOAD">Imagem/Video (arquivo ou URL)</option>
        <option value="YOUTUBE">Video do YouTube</option>
      </select>

      {mediaSource === 'UPLOAD' && (
        <select
          className="h-10 rounded-xl border-2 border-input bg-background px-3 text-sm"
          value={mediaType}
          onChange={(e) => onChange('mediaType', e.target.value)}
        >
          <option value="image">Imagem</option>
          <option value="video">Video (arquivo)</option>
        </select>
      )}

      {mediaSource && (
        <>
          <Input
            placeholder={mediaSource === 'YOUTUBE' ? 'https://youtube.com/watch?v=...' : 'https://.../arquivo.png'}
            value={mediaUrl}
            onChange={(e) => onChange('mediaUrl', e.target.value)}
          />
          {mediaSource === 'UPLOAD' && (
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                id={`file-${prefix}`}
                type="file"
                accept={mediaType === 'video' ? 'video/*' : 'image/*'}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? 'Enviando...' : 'Procurar arquivo'}
              </Button>
              <span className="text-xs text-muted-foreground">
                {mediaType === 'video' ? 'Video ate 25MB' : 'Imagem ate 5MB'}
              </span>
            </div>
          )}
          {mediaUrl && (
            <div className="mt-1">
              <span className="mb-1 block text-xs text-muted-foreground">Pre-visualizacao:</span>
              <div className="max-w-xs">
                <MediaView mediaUrl={mediaUrl} mediaType={mediaType} mediaSource={mediaSource} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
