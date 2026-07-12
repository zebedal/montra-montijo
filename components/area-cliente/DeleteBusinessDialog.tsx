"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

import { deleteMyBusiness } from "@/lib/helpers";
import { Routes } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: {
    id: string;
    name: string;
    plan: string;
    cancel_at_period_end: boolean;
  };
};

export default function DeleteBusinessDialog({
  open,
  onOpenChange,
  business
}: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const hasActivePremiumRenewal =
    business.plan === "premium" && !business.cancel_at_period_end;

  async function handleDelete() {
    try {
      setIsDeleting(true);

      await deleteMyBusiness(business.id);

      toast.success("Negócio apagado com sucesso.", {
        position: "top-center"
      });

      onOpenChange(false);
      router.push(Routes.AREA_CLIENTE);
      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível apagar o negócio.",
        {
          position: "top-center"
        }
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="h-6 w-6 text-destructive" />
          </div>

          <AlertDialogTitle>Apagar {business.name}?</AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="space-y-3">
              {hasActivePremiumRenewal ? (
                <>
                  <p>
                    Este negócio tem uma subscrição Premium com renovação
                    automática ativa.
                  </p>

                  <p className="font-medium text-foreground">
                    Cancele primeiro a renovação em &quot;Gerir subscrição&quot;
                    antes de apagar o negócio.
                  </p>
                </>
              ) : (
                <>
                  <p>Esta ação é permanente e não poderá ser revertida.</p>

                  <p>
                    Serão removidos os dados do negócio, o logótipo, as
                    fotografias e os horários.
                  </p>

                  {business.plan === "premium" &&
                    business.cancel_at_period_end && (
                      <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
                        Este negócio ainda tem Premium disponível. Ao apagá-lo,
                        perderá imediatamente o período restante.
                      </p>
                    )}
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>

          {!hasActivePremiumRenewal && (
            <AlertDialogAction
              onClick={(event: { preventDefault: () => void }) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />

              {isDeleting ? "A apagar..." : "Apagar definitivamente"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
