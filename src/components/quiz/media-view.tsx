"use client";

interface Props {
  mediaUrl?: string | null;
  mediaType?: string | null;
  mediaSource?: string | null;
}

export function MediaView({ mediaUrl, mediaType, mediaSource }: Props) {
  if (!mediaUrl) return null;
  if (mediaSource === 'YOUTUBE') {
    const id = mediaUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1];
    if (!id) return null;
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border">
        <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${id}`} title="video" allowFullScreen />
      </div>
    );
  }
  if (mediaType === 'video') {
    return <video className="w-full rounded-2xl border border-border" src={mediaUrl} controls />;
  }
  return <img className="w-full rounded-2xl border border-border" src={mediaUrl} alt="" />;
}
