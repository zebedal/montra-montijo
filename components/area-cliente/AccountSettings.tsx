"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  changePasswordSchema,
  type ChangePasswordFormData
} from "@/lib/schemas/changePasswordSchema";
import { supabase } from "@/lib/supabase/client";
import DeleteAccountSection from "./DeleteAccountSection";

export default function AccountSettings() {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),

    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  });

  function closePasswordDialog() {
    setPasswordDialogOpen(false);

    reset({
      newPassword: "",
      confirmPassword: ""
    });

    setShowNewPassword(false);
    setShowPasswordConfirmation(false);
  }

  function handlePasswordDialogChange(open: boolean) {
    setPasswordDialogOpen(open);

    if (!open) {
      reset({
        newPassword: "",
        confirmPassword: ""
      });

      setShowNewPassword(false);
      setShowPasswordConfirmation(false);
    }
  }

  async function handlePasswordSubmit(data: ChangePasswordFormData) {
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword
    });

    if (error) {
      const message =
        error.message ===
        "New password should be different from the old password."
          ? "A nova palavra-passe tem de ser diferente da atual."
          : error.message === "Password should be at least 6 characters."
            ? "A palavra-passe deve ter pelo menos 6 caracteres."
            : "Não foi possível alterar a palavra-passe. Tente novamente.";
      toast.error("Não foi possível alterar a palavra-passe.", {
        position: "top-center",
        description: message
      });

      return;
    }

    toast.success("Palavra-passe alterada com sucesso.", {
      position: "top-center"
    });

    closePasswordDialog();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Definições</h1>

        <p className="mt-2 text-muted-foreground">
          Faça a gestão da segurança e dos dados associados à sua conta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>

            <div className="space-y-1">
              <CardTitle>Segurança da conta</CardTitle>

              <p className="text-sm leading-6 text-muted-foreground">
                Atualize a sua palavra-passe para manter a conta protegida.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

              <div>
                <p className="font-medium">Palavra-passe</p>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Escolha uma palavra-passe segura que não utilize noutros
                  serviços.
                </p>
              </div>
            </div>

            <Dialog
              open={passwordDialogOpen}
              onOpenChange={handlePasswordDialogChange}
            >
              <DialogTrigger asChild>
                <Button variant="outline" className="shrink-0">
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  Alterar palavra-passe
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit(handlePasswordSubmit)}>
                  <DialogHeader>
                    <DialogTitle>Alterar palavra-passe</DialogTitle>

                    <DialogDescription>
                      Introduza e confirme a nova palavra-passe da sua conta.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-5 py-6">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova palavra-passe</Label>

                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Introduza a nova palavra-passe"
                          autoComplete="new-password"
                          className="pr-10"
                          aria-invalid={errors.newPassword ? "true" : "false"}
                          {...register("newPassword")}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword((current) => !current)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={
                            showNewPassword
                              ? "Ocultar palavra-passe"
                              : "Mostrar palavra-passe"
                          }
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {errors.newPassword ? (
                        <p className="text-sm text-red-500">
                          {errors.newPassword.message}
                        </p>
                      ) : (
                        <p className="text-xs leading-5 text-muted-foreground">
                          Utilize pelo menos 8 caracteres e evite palavras-passe
                          fáceis de adivinhar.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirmar nova palavra-passe
                      </Label>

                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showPasswordConfirmation ? "text" : "password"}
                          placeholder="Repita a nova palavra-passe"
                          autoComplete="new-password"
                          className="pr-10"
                          aria-invalid={
                            errors.confirmPassword ? "true" : "false"
                          }
                          {...register("confirmPassword")}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswordConfirmation((current) => !current)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={
                            showPasswordConfirmation
                              ? "Ocultar confirmação da palavra-passe"
                              : "Mostrar confirmação da palavra-passe"
                          }
                        >
                          {showPasswordConfirmation ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="flex flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closePasswordDialog}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting
                        ? "A atualizar..."
                        : "Atualizar palavra-passe"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <DeleteAccountSection />
    </div>
  );
}
