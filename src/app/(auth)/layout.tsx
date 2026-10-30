import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <Link href="/" className="mb-6 flex flex-col items-center gap-2 sm:mb-8">
        <span className="text-4xl sm:text-5xl">📖</span>
        <span className="text-center font-display text-xl font-extrabold text-gradient sm:text-2xl">Desafio dos Valentes</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
