import { z } from "zod";

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

export function extractYouTubeId(url: string): string | null {
  const match = url.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
}

export function youTubeEmbedUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

const URL_RE = new RegExp('^https?://');
const mediaUrlSchema = z
  .string()
  .refine((v) => v === '' || URL_RE.test(v) || v.startsWith('/'), { message: 'URL invalida' })
  .optional();

export const mediaSchema = z
  .object({
    mediaUrl: mediaUrlSchema,
    mediaType: z.enum(["image", "video"]).optional(),
    mediaSource: z.enum(["UPLOAD", "YOUTUBE"]).optional(),
  })
  .optional();

export const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Texto da alternativa obrigatório"),
  isCorrect: z.boolean(),
  mediaUrl: mediaUrlSchema,
  mediaType: z.enum(["image", "video"]).optional(),
  mediaSource: z.enum(["UPLOAD", "YOUTUBE"]).optional(),
});

export const questionSchema = z.object({
  text: z.string().min(1, "Enunciado obrigatório"),
  mediaUrl: mediaUrlSchema,
  mediaType: z.enum(["image", "video"]).optional(),
  mediaSource: z.enum(["UPLOAD", "YOUTUBE"]).optional(),
  options: z
    .array(optionSchema)
    .min(2, "Mínimo de 2 alternativas")
    .max(6, "Máximo de 6 alternativas")
    .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, {
      message: "Exatamente uma alternativa correta",
    }),
});

export type QuestionInput = z.infer<typeof questionSchema>;
