"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { loginSchema } from "@/lib/schemas/loginSchema";
import { signupSchema } from "@/lib/schemas/signupSchema";
import { Routes } from "@/types";
import { useUser } from "@/lib/supabase/useUser";

type FormData = {
  email: string;
  password: string;
};

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");

  const schema = mode === "login" ? loginSchema : signupSchema;

  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      router.replace(Routes.AREA_CLIENTE);
    }
  }, [user, loading, router]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  function changeMode(nextMode: "login" | "signup") {
    setMode(nextMode);

    reset({
      email: "",
      password: ""
    });
  }

  async function onSubmit(data: FormData) {
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      });

      if (error) {
        alert(error.message);
        return;
      }

      router.push(Routes.CRIAR_NEGOCIO);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push(Routes.AREA_CLIENTE);
  }

  return (
    <div className="mx-auto mt-20 max-w-md space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>

        <p className="text-sm text-muted-foreground">
          {mode === "login"
            ? "Bem-vindo de volta à Montra Montijo"
            : "Cria a tua conta e adiciona o teu negócio"}
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
            Ainda não tens conta?{" "}
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
            Já tens conta?{" "}
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
