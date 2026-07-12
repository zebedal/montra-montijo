"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import {
  updatePasswordSchema,
  type UpdatePasswordFormData
} from "@/lib/schemas/updatePasswordSchema";
import { Routes } from "@/types";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    let mounted = true;

    async function validateSession() {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (error || !user) {
        setHasValidSession(false);
        setIsCheckingSession(false);
        return;
      }

      setHasValidSession(true);
      setIsCheckingSession(false);
    }

    void validateSession();

    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(data: UpdatePasswordFormData) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) {
        throw error;
      }

      setPasswordUpdated(true);

      toast.success("Palavra-passe atualizada com sucesso.", {
        position: "top-center"
      });

      /*
       * Terminar a sessão temporária de recuperação.
       * O utilizador volta depois a autenticar-se normalmente.
       */
      await supabase.auth.signOut();
    } catch (error) {
      console.error(error);

      toast.error("Não foi possível atualizar a palavra-passe.", {
        description:
          error instanceof Error
            ? error.message
            : "Peça um novo link de recuperação e tente novamente.",
        position: "top-center"
      });
    }
  }

  if (isCheckingSession) {
    return (
      <div className="mx-auto mt-20 max-w-md px-4">
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          <KeyRound className="mx-auto h-8 w-8 animate-pulse text-primary" />

          <p className="mt-4 text-sm text-muted-foreground">
            A validar o link de recuperação...
          </p>
        </div>
      </div>
    );
  }

  if (!hasValidSession) {
    return (
      <div className="mx-auto mt-20 max-w-md px-4">
        <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <KeyRound className="h-7 w-7 text-destructive" />
          </div>

          <h1 className="mt-5 text-2xl font-bold">Link inválido ou expirado</h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Este link de recuperação já não é válido. Peça um novo email para
            definir a sua palavra-passe.
          </p>

          <Button asChild className="mt-6 w-full">
            <Link href="/recuperar-password">Pedir um novo link</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (passwordUpdated) {
    return (
      <div className="mx-auto mt-20 max-w-md px-4">
        <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-7 w-7 text-green-700" />
          </div>

          <h1 className="mt-5 text-2xl font-bold">Palavra-passe atualizada</h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Já pode iniciar sessão com a sua nova palavra-passe.
          </p>

          <Button
            type="button"
            className="mt-6 w-full"
            onClick={() => router.replace(Routes.LOGIN)}
          >
            Iniciar sessão
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-md space-y-6 px-4">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-7 w-7 text-primary" />
        </div>

        <h1 className="pt-3 text-2xl font-bold">Definir nova palavra-passe</h1>

        <p className="text-sm leading-6 text-muted-foreground">
          Escolha uma nova palavra-passe segura para a sua conta.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm"
      >
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Nova palavra-passe
          </label>

          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo de 8 caracteres"
              autoComplete="new-password"
              className="pr-10"
              disabled={isSubmitting}
              {...register("password")}
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
              aria-label={
                showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirmar palavra-passe
          </label>

          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmation ? "text" : "password"}
              placeholder="Repita a nova palavra-passe"
              autoComplete="new-password"
              className="pr-10"
              disabled={isSubmitting}
              {...register("confirmPassword")}
            />

            <button
              type="button"
              onClick={() => setShowConfirmation((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
              aria-label={
                showConfirmation ? "Ocultar confirmação" : "Mostrar confirmação"
              }
            >
              {showConfirmation ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <KeyRound className="mr-2 h-4 w-4" />

          {isSubmitting ? "A atualizar..." : "Guardar nova palavra-passe"}
        </Button>
      </form>
    </div>
  );
}
