import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  return (
    <div className="rounded-3xl border border-border glass p-5 sm:p-6">
      <h1 className="mb-1 font-display text-2xl font-bold">Bem-vindo de volta!</h1>
      <p className="mb-6 text-sm text-muted-foreground">Entre para continuar o desafio.</p>
      <AuthForm mode="login" action={loginAction} />
    </div>
  );
}
