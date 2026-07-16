"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { loginSchema } from "@/lib/schemas/loginSchema";
import { signupSchema } from "@/lib/schemas/signupSchema";
import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/useUser";

import { Routes } from "@/types";

type FormData = {
  email: string;
  password: string;
  confirmPassword?: string;
};

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<AuthMode>("login");
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(
    null
  );
  const [isResending, setIsResending] = useState(false);

  const { user, loading } = useUser();

  const nextPath = searchParams.get("next");

  const redirectPath =
    nextPath?.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : Routes.AREA_CLIENTE;

  const schema = mode === "login" ? loginSchema : signupSchema;

  const emailRedirectTo = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const callbackUrl = new URL("/auth/callback", window.location.origin);

    callbackUrl.searchParams.set("next", redirectPath);
    callbackUrl.searchParams.set("flow", "signup");

    return callbackUrl.toString();
  }, [redirectPath]);

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectPath);
    }
  }, [user, loading, router, redirectPath]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const password = watch("password");

  const passwordRequirements = [
    {
      label: "Pelo menos 8 caracteres",
      valid: password.length >= 8
    },
    {
      label: "Uma letra maiúscula",
      valid: /[A-Z]/.test(password)
    },
    {
      label: "Uma letra minúscula",
      valid: /[a-z]/.test(password)
    },
    {
      label: "Um número",
      valid: /[0-9]/.test(password)
    }
  ];

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setConfirmationEmail(null);

    reset({
      email: "",
      password: "",
      confirmPassword: ""
    });
  }

  async function handleResendConfirmation() {
    if (!confirmationEmail || isResending) {
      return;
    }

    setIsResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: confirmationEmail,
        options: {
          emailRedirectTo
        }
      });

      if (error) {
        throw error;
      }

      toast.success("Email enviado novamente.", {
        description:
          "Verifique também a pasta de spam ou correio não solicitado."
      });
    } catch (error) {
      toast.error("Não foi possível reenviar o email.", {
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente dentro de alguns instantes."
      });
    } finally {
      setIsResending(false);
    }
  }

  async function onSubmit(data: FormData) {
    if (mode === "signup") {
      const { data: signupData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo
        }
      });

      if (error) {
        toast.error("Não foi possível criar a conta.", {
          description: error.message
        });

        return;
      }

      /*
       * Em ambientes onde a confirmação de email não é obrigatória,
       * o Supabase pode devolver uma sessão imediatamente.
       */
      if (signupData.session) {
        toast.success("Verifique o seu email.", {
          description:
            "Se este endereço ainda não estiver registado, receberá um link de confirmação."
        });

        router.replace(redirectPath);
        return;
      }

      /*
       * Com confirmação de email obrigatória, não existe sessão.
       * Mostramos um ecrã dedicado em vez de encaminhar o utilizador
       * para uma página protegida.
       */
      setConfirmationEmail(data.email);

      reset({
        email: "",
        password: "",
        confirmPassword: ""
      });

      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (error) {
      toast.error("Não foi possível iniciar sessão.", {
        description:
          error.message === "Invalid login credentials"
            ? "Email ou palavra-passe incorretos."
            : error.message
      });

      return;
    }

    toast.success("Sessão iniciada com sucesso.");

    router.replace(redirectPath);
  }

  if (confirmationEmail) {
    return (
      <div className="mx-auto my-20 max-w-md px-4">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-8 w-8 text-green-700" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Verifique o seu email</h1>

            <p className="text-sm leading-6 text-muted-foreground">
              Se ainda não existir uma conta associada a este endereço, enviámos
              um link para confirmar o registo:
            </p>

            <p className="font-medium text-foreground">{confirmationEmail}</p>

            <p className="text-sm leading-6 text-muted-foreground">
              Clique no link enviado para confirmar a sua conta e continuar.
              Verifique também a pasta de spam ou correio não solicitado.
            </p>
          </div>

          <div className="w-full space-y-3">
            <Button
              type="button"
              className="w-full bg-green-600 text-white hover:bg-green-700"
              onClick={handleResendConfirmation}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />A reenviar...
                </>
              ) : (
                "Reenviar email"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => changeMode("login")}
            >
              Voltar ao início de sessão
            </Button>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-muted p-4 text-left">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" />

            <p className="text-xs leading-5 text-muted-foreground">
              Não é necessário criar outra conta. Caso o email demore a chegar,
              aguarde alguns instantes antes de o reenviar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto my-20 max-w-md space-y-6 px-4">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>

        <p className="text-sm text-muted-foreground">
          {mode === "login"
            ? "Bem-vindo de volta à Montra Montijo."
            : "Crie a sua conta e adicione o seu negócio."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            autoComplete="email"
            {...register("email")}
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Palavra-passe"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            {...register("password")}
          />

          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}

          {mode === "signup" && (
            <div className="grid grid-cols-1 gap-1.5 rounded-lg bg-muted/60 p-3 sm:grid-cols-2">
              {passwordRequirements.map((requirement) => (
                <div
                  key={requirement.label}
                  className="flex items-center gap-2 text-xs"
                >
                  <span
                    className={
                      requirement.valid
                        ? "h-1.5 w-1.5 rounded-full bg-green-600"
                        : "h-1.5 w-1.5 rounded-full bg-muted-foreground/40"
                    }
                  />

                  <span
                    className={
                      requirement.valid
                        ? "text-green-700"
                        : "text-muted-foreground"
                    }
                  >
                    {requirement.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {mode === "login" && (
            <div className="flex justify-end">
              <Link
                href={Routes.RECUPERAR_PASSWORD}
                className="text-sm font-medium text-green-600 transition-colors hover:text-green-700 hover:underline"
              >
                Esqueceu-se da palavra-passe?
              </Link>
            </div>
          )}
        </div>

        {mode === "signup" && (
          <div>
            <Input
              type="password"
              placeholder="Confirmar palavra-passe"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />

            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-green-600 text-white hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? mode === "login"
              ? "A entrar..."
              : "A criar conta..."
            : mode === "login"
              ? "Entrar"
              : "Criar conta"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Ainda não tem conta?{" "}
            <button
              type="button"
              onClick={() => changeMode("signup")}
              className="cursor-pointer font-medium text-green-600 hover:underline"
            >
              Criar conta
            </button>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <button
              type="button"
              onClick={() => changeMode("login")}
              className="cursor-pointer font-medium text-green-600 hover:underline"
            >
              Entrar
            </button>
          </>
        )}
      </p>
    </div>
  );
}
