"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Heart, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/useUser";

type Props = {
  businessId: string;
  businessName: string;
  businessSlug: string;
  iconOnly?: boolean;
};

export default function FavoriteButton({
  businessId,
  businessName,
  businessSlug,
  iconOnly = false
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, loading: isUserLoading } = useUser();

  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const businessPath = `/negocio/${businessSlug}`;

  const returnPath = `${businessPath}?favorite=${encodeURIComponent(
    businessId
  )}`;

  const loginUrl = `/login?next=${encodeURIComponent(returnPath)}`;

  /*
   * Verificar se o negócio já está guardado.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadFavorite() {
      if (isUserLoading) {
        return;
      }

      if (!user) {
        if (!cancelled) {
          setIsFavorite(false);
          setIsLoadingFavorite(false);
        }

        return;
      }

      setIsLoadingFavorite(true);

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("business_id", businessId)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (error) {
        console.error("Erro ao verificar o favorito:", error);

        setIsFavorite(false);
        setIsLoadingFavorite(false);

        return;
      }

      setIsFavorite(Boolean(data));
      setIsLoadingFavorite(false);
    }

    loadFavorite();

    return () => {
      cancelled = true;
    };
  }, [businessId, isUserLoading, user]);

  /*
   * Guardar automaticamente depois do login.
   *
   * Exemplo:
   * /negocio/sunset-bar-montijo?favorite=<businessId>
   */
  useEffect(() => {
    if (isUserLoading || !user) {
      return;
    }

    const pendingFavoriteId = searchParams.get("favorite");

    if (pendingFavoriteId !== businessId) {
      return;
    }

    let cancelled = false;

    async function savePendingFavorite() {
      setIsUpdating(true);

      const { error } = await supabase.from("favorites").upsert(
        {
          user_id: user.id,
          business_id: businessId
        },
        {
          onConflict: "user_id,business_id",
          ignoreDuplicates: true
        }
      );

      if (cancelled) {
        return;
      }

      if (error) {
        console.error("Erro ao guardar o favorito após o login:", error);

        toast.error("Não foi possível guardar o negócio nos favoritos.", {
          position: "top-center"
        });

        setIsUpdating(false);
        return;
      }

      setIsFavorite(true);
      setIsLoadingFavorite(false);
      setIsUpdating(false);

      toast.success("Negócio adicionado aos favoritos.", {
        position: "top-center"
      });

      /*
       * Limpar ?favorite=... sem recarregar a página.
       */
      router.replace(businessPath, {
        scroll: false
      });
    }

    savePendingFavorite();

    return () => {
      cancelled = true;
    };
  }, [businessId, businessPath, isUserLoading, router, searchParams, user]);

  async function handleFavoriteClick() {
    if (isUserLoading || isLoadingFavorite || isUpdating) {
      return;
    }

    if (!user) {
      setLoginDialogOpen(true);
      return;
    }

    const previousValue = isFavorite;

    setIsFavorite(!previousValue);
    setIsUpdating(true);

    try {
      if (previousValue) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("business_id", businessId);

        if (error) {
          throw error;
        }

        toast.success("Negócio removido dos favoritos.", {
          position: "top-center"
        });
        return;
      }

      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        business_id: businessId
      });

      if (error) {
        if (error.code === "23505") {
          setIsFavorite(true);
          return;
        }

        throw error;
      }

      toast.success("Negócio adicionado aos favoritos.", {
        position: "top-center"
      });
    } catch (error) {
      console.error("Erro ao atualizar o favorito:", error);

      setIsFavorite(previousValue);

      toast.error("Não foi possível atualizar os favoritos.", {
        position: "top-center"
      });
    } finally {
      setIsUpdating(false);
    }
  }

  const isLoading = isUserLoading || isLoadingFavorite || isUpdating;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={iconOnly ? "icon" : "default"}
        onClick={handleFavoriteClick}
        disabled={isLoading}
        aria-pressed={isFavorite}
        aria-label={
          isFavorite
            ? `Remover ${businessName} dos favoritos`
            : `Adicionar ${businessName} aos favoritos`
        }
        title={isFavorite ? "Remover dos favoritos" : "Guardar nos favoritos"}
        className={
          iconOnly
            ? "rounded-full bg-background/90 shadow-sm backdrop-blur-sm hover:bg-background"
            : undefined
        }
      >
        {isLoading ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFavorite ? "fill-red-500 text-red-500" : "text-foreground"
            }`}
          />
        )}

        {!iconOnly && (
          <span className="ml-2">{isFavorite ? "Guardado" : "Guardar"}</span>
        )}
      </Button>

      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Guarde os seus negócios favoritos</DialogTitle>

            <DialogDescription>
              Entre na sua conta ou crie uma conta gratuita para guardar{" "}
              <span className="font-medium text-foreground">
                {businessName}
              </span>{" "}
              e consultá-lo mais tarde.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 ">
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
    </>
  );
}
