import { AuthForm } from "@/components/auth/auth-form";
import { registerAction } from "@/actions/auth";

export default function RegisterPage() {
  return (
    <div className="rounded-3xl border border-border glass p-5 sm:p-6">
      <h1 className="mb-1 font-display text-2xl font-bold">Criar conta</h1>
      <p className="mb-6 text-sm text-muted-foreground">Escolha um usuario, uma senha e informe seu telefone.</p>
      <AuthForm mode="register" action={registerAction} />
    </div>
  );
}
