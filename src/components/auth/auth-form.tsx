"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionState } from "@/actions/auth";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { USER_EMOJIS } from "@/lib/emojis";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "Carregando..." : label}
    </Button>
  );
}

interface Props {
  mode: "login" | "register";
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
}

export function AuthForm({ mode, action }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, {});
  const [emoji, setEmoji] = useState(() => USER_EMOJIS[Math.floor(Math.random() * USER_EMOJIS.length)]);

  useEffect(() => {
    if (state.success === "ok") {
      router.push("/groups");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">Usuario</Label>
        <Input id="username" name="username" placeholder="seu_usuario" autoComplete="username" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" placeholder="senha" autoComplete={mode === "login" ? "current-password" : "new-password"} required />
      </div>
      {mode === "register" && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" name="phone" inputMode="tel" placeholder="(11) 99999-9999" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Seu emoji</Label>
            <div className="flex items-center gap-3">
              <EmojiPicker value={emoji} onChange={setEmoji} options={USER_EMOJIS} label="Escolher emoji" />
              <span className="text-xs text-muted-foreground">Se nao escolher, um aleatorio sera vinculado.</span>
            </div>
            <input type="hidden" name="emoji" value={emoji} />
          </div>
        </>
      )}

      {state.error && (
        <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <SubmitButton label={mode === "login" ? "Entrar" : "Criar conta"} />

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Sem conta? <Link href="/register" className="font-semibold text-neon-cyan hover:underline">Cadastre-se</Link>
          </>
        ) : (
          <>
            Ja tem conta? <Link href="/login" className="font-semibold text-neon-cyan hover:underline">Entrar</Link>
          </>
        )}
      </p>
    </form>
  );
}
