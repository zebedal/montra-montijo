"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
  businessClaimSchema,
  type BusinessClaimFormData
} from "@/lib/schemas/businessClaimSchema";
import { useUser } from "@/lib/supabase/useUser";

type Props = {
  businessId: string;
  businessName: string;
  businessSlug: string;
  currentOwnerUserId: string | null;
};

const businessRoles = [
  {
    value: "owner",
    label: "Sou proprietário do negócio"
  },
  {
    value: "manager",
    label: "Sou gerente ou responsável"
  },
  {
    value: "employee",
    label: "Trabalho no negócio"
  },
  {
    value: "agency",
    label: "Faço a gestão digital do negócio"
  },
  {
    value: "other",
    label: "Outra relação com o negócio"
  }
] as const;

export default function BusinessClaimButton({
  businessId,
  businessName,
  businessSlug,
  currentOwnerUserId
}: Props) {
  const { user, loading: isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const businessPath = `/negocio/${businessSlug}`;

  const claimPath = `${businessPath}?claim=${encodeURIComponent(businessId)}`;

  const loginUrl = `/login?next=${encodeURIComponent(claimPath)}`;

  useEffect(() => {
    if (isUserLoading || !user) {
      return;
    }

    const pendingClaimId = searchParams.get("claim");

    if (pendingClaimId !== businessId) {
      return;
    }

    if (currentOwnerUserId === user.id) {
      router.replace(businessPath, {
        scroll: false
      });

      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDialogOpen(true);

    router.replace(businessPath, {
      scroll: false
    });
  }, [
    businessId,
    businessPath,
    currentOwnerUserId,
    isUserLoading,
    router,
    searchParams,
    user
  ]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<BusinessClaimFormData>({
    resolver: zodResolver(businessClaimSchema),

    defaultValues: {
      businessId,
      fullName: "",
      roleInBusiness: undefined,
      phone: "",
      message: ""
    }
  });

  /*
   * O proprietário atualmente associado não deve poder
   * reivindicar o próprio negócio.
   */
  if (user && currentOwnerUserId === user.id) {
    return null;
  }

  function handleOpenClaim() {
    if (isUserLoading) {
      return;
    }

    if (!user) {
      setLoginDialogOpen(true);
      return;
    }

    setDialogOpen(true);
  }

  function handleClaimDialogChange(open: boolean) {
    if (isSubmitting) {
      return;
    }

    setDialogOpen(open);

    if (!open && !requestSent) {
      reset({
        businessId,
        fullName: "",
        roleInBusiness: undefined,
        phone: "",
        message: ""
      });
    }
  }

  async function onSubmit(data: BusinessClaimFormData) {
    try {
      const response = await fetch("/api/business-claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        toast.error(
          toast.error(result.error ?? "Não foi possível enviar o pedido."),
          {
            description: result.error ?? "Verifique os dados e tente novamente."
          }
        );

        return;
      }

      setRequestSent(true);

      toast.success("Pedido de reivindicação enviado com sucesso.");
    } catch (error) {
      console.error("Erro ao enviar pedido de reivindicação:", error);

      toast.error("Não foi possível enviar o pedido.", {
        description: "Verifique a ligação à internet e tente novamente."
      });
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleOpenClaim}
        disabled={isUserLoading}
        className="w-full"
      >
        <Building2 className="mr-2 h-4 w-4" />
        Este negócio é seu?
      </Button>

      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reivindicar {businessName}</DialogTitle>

            <DialogDescription>
              Entre na sua conta ou crie uma conta gratuita para enviar um
              pedido de reivindicação deste negócio.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLoginDialogOpen(false)}
            >
              Cancelar
            </Button>

            <Button asChild>
              <Link href={loginUrl}>Entrar ou criar conta</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={handleClaimDialogChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {requestSent ? (
            <>
              <DialogHeader>
                <DialogTitle>Pedido enviado</DialogTitle>

                <DialogDescription>
                  Recebemos o seu pedido para reivindicar{" "}
                  <span className="font-medium text-foreground">
                    {businessName}
                  </span>
                  .
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-xl border bg-muted/30 p-5 text-sm leading-6 text-muted-foreground">
                O pedido será analisado manualmente. Poderemos contactá-lo para
                confirmar a sua relação com o negócio antes de transferirmos o
                acesso.
              </div>

              <DialogFooter>
                <Button type="button" onClick={() => setDialogOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <input type="hidden" {...register("businessId")} />

              <DialogHeader>
                <DialogTitle>Reivindicar este negócio</DialogTitle>

                <DialogDescription>
                  Envie-nos os seus dados para confirmarmos que está autorizado
                  a gerir {businessName}.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-6">
                <div className="space-y-2">
                  <Label htmlFor="claim-full-name">Nome completo</Label>

                  <Input
                    id="claim-full-name"
                    placeholder="O seu nome completo"
                    autoComplete="name"
                    {...register("fullName")}
                  />

                  {errors.fullName && (
                    <p className="text-sm text-red-500">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Qual é a sua relação com o negócio?</Label>

                  <Select
                    onValueChange={(value) => {
                      setValue(
                        "roleInBusiness",
                        value as BusinessClaimFormData["roleInBusiness"],
                        {
                          shouldDirty: true,
                          shouldValidate: true
                        }
                      );
                    }}
                  >
                    <SelectTrigger
                      aria-invalid={errors.roleInBusiness ? "true" : "false"}
                    >
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>

                    <SelectContent>
                      {businessRoles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {errors.roleInBusiness && (
                    <p className="text-sm text-red-500">
                      {errors.roleInBusiness.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="claim-phone">Telefone</Label>

                  <Input
                    id="claim-phone"
                    type="tel"
                    placeholder="Contacto telefónico"
                    autoComplete="tel"
                    {...register("phone")}
                  />

                  {errors.phone && (
                    <p className="text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="claim-message">Informação adicional</Label>

                  <Textarea
                    id="claim-message"
                    placeholder="Explique brevemente como podemos confirmar a sua relação com o negócio."
                    className="min-h-28 resize-none"
                    {...register("message")}
                  />

                  {errors.message && (
                    <p className="text-sm text-red-500">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <p className="text-xs leading-5 text-muted-foreground">
                  O envio do pedido não transfere automaticamente o negócio. A
                  informação será analisada antes de qualquer alteração.
                </p>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />A
                      enviar...
                    </>
                  ) : (
                    "Enviar pedido"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
