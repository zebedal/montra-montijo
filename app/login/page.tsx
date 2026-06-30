"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { loginSchema } from "@/lib/schemas/loginSchema";
import { signupSchema } from "@/lib/schemas/signupSchema";

type FormData = {
  email: string;
  password: string;
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");

  const schema = mode === "login" ? loginSchema : signupSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

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

      router.push("/add-business");
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

    router.push("/dashboard");
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>

        <p className="text-sm text-muted-foreground">
          {mode === "login"
            ? "Bem-vindo de volta à Montra Montijo"
            : "Cria a tua conta e adiciona o teu negócio"}
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* EMAIL */}
        <div>
          <Input placeholder="Email" {...register("email")} />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div>
          <Input
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* SUBMIT */}
        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          disabled={isSubmitting}
        >
          {mode === "login" ? "Entrar" : "Criar conta"}
        </Button>
      </form>

      {/* TOGGLE */}
      <p className="text-sm text-center text-muted-foreground">
        {mode === "login" ? (
          <>
            Ainda não tens conta?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="text-green-600 hover:underline font-medium"
            >
              Criar conta
            </button>
          </>
        ) : (
          <>
            Já tens conta?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-green-600 hover:underline font-medium"
            >
              Entrar
            </button>
          </>
        )}
      </p>
    </div>
  );
}
