"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/useUser";
import { Routes } from "@/types";
import { useRouter } from "next/navigation";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      router.replace(Routes.AREA_CLIENTE);
    }
  }, [user, loading, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Indique o seu endereço de email.", {
        position: "top-center"
      });

      return;
    }

    try {
      setIsSubmitting(true);

      const redirectTo = `${window.location.origin}/auth/callback?next=/nova-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo
        }
      );

      if (error) {
        throw error;
      }

      setEmailSent(true);

      toast.success("Email de recuperação enviado.", {
        description:
          "Consulte a sua caixa de entrada para definir uma nova palavra-passe.",
        position: "top-center"
      });
    } catch (error) {
      console.error(error);

      toast.error("Não foi possível enviar o email de recuperação.", {
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente dentro de alguns instantes.",
        position: "top-center"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading || user) {
    return null;
  }

  if (emailSent) {
    return (
      <div className="mx-auto mt-20 max-w-md px-4">
        <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-7 w-7 text-green-700" />
          </div>

          <h1 className="mt-5 text-2xl font-bold">Verifique o seu email</h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Enviámos um link de recuperação para:
          </p>

          <p className="mt-1 break-all font-medium">
            {email.trim().toLowerCase()}
          </p>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Abra o link recebido para definir uma nova palavra-passe. Verifique
            também a pasta de spam caso não encontre o email.
          </p>

          <div className="mt-6 space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setEmailSent(false)}
            >
              Enviar novamente
            </Button>

            <Button asChild className="w-full">
              <Link href={Routes.LOGIN}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao início de sessão
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-md space-y-6 px-4">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-7 w-7 text-primary-green" />
        </div>

        <h1 className="pt-3 text-2xl font-bold">Recuperar palavra-passe</h1>

        <p className="text-sm leading-6 text-muted-foreground">
          Indique o email associado à sua conta. Enviaremos um link para definir
          uma nova palavra-passe.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm"
      >
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>

          <Input
            id="email"
            type="email"
            placeholder="nome@exemplo.pt"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || !email.trim()}
        >
          <Mail className="mr-2 h-4 w-4" />

          {isSubmitting ? "A enviar..." : "Enviar link de recuperação"}
        </Button>
      </form>

      <div className="text-center">
        <Link
          href={Routes.LOGIN}
          className="inline-flex items-center text-sm font-medium text-green-700 hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao início de sessão
        </Link>
      </div>
    </div>
  );
}
