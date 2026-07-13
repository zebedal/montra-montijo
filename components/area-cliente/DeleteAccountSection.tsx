"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { supabase } from "@/lib/supabase/client";

export default function DeleteAccountSection() {
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = confirmation === "ELIMINAR" && !isDeleting;

  function handleDialogChange(open: boolean) {
    if (isDeleting) {
      return;
    }

    setDialogOpen(open);

    if (!open) {
      setConfirmation("");
    }
  }

  async function handleDeleteAccount() {
    if (!canDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          confirmation
        })
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        toast.error("Não foi possível eliminar a conta.", {
          position: "top-center",
          description:
            result.error ?? "Ocorreu um erro inesperado. Tente novamente."
        });

        return;
      }

      /*
       * O utilizador foi eliminado no servidor, mas a sessão local
       * ainda pode permanecer no browser até ser removida.
       */
      await supabase.auth.signOut();

      toast.success("A sua conta foi eliminada.", { position: "top-center" });

      router.replace("/");
      router.refresh();
    } catch {
      toast.error("Não foi possível eliminar a conta.", {
        position: "top-center",
        description: "Verifique a ligação à internet e tente novamente."
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Zona de perigo</CardTitle>

          <p className="text-sm leading-6 text-muted-foreground">
            As ações desta secção podem provocar a eliminação permanente dos
            seus dados.
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4 rounded-xl border border-destructive/20 bg-destructive/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Eliminar conta</p>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              A conta, os negócios, as fotografias, os horários e os restantes
              dados associados serão eliminados permanentemente. Subscrições
              Premium ativas terão primeiro de ser canceladas.
            </p>
          </div>

          <AlertDialog open={dialogOpen} onOpenChange={handleDialogChange}>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" className="shrink-0">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar conta
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Eliminar permanentemente a conta?
                </AlertDialogTitle>

                <AlertDialogDescription>
                  Esta ação não poderá ser anulada. Todos os negócios e dados
                  associados à sua conta poderão ser eliminados.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="space-y-2 py-2">
                <Label htmlFor="delete-account-confirmation">
                  Escreva{" "}
                  <span className="font-semibold text-foreground">
                    ELIMINAR
                  </span>{" "}
                  para confirmar
                </Label>

                <Input
                  id="delete-account-confirmation"
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder="ELIMINAR"
                  autoComplete="off"
                  disabled={isDeleting}
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>
                  Cancelar
                </AlertDialogCancel>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={!canDelete}
                >
                  {isDeleting ? "A eliminar..." : "Eliminar definitivamente"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
